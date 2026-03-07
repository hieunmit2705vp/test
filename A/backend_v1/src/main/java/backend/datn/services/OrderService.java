package backend.datn.services;

import backend.datn.dto.response.OrderDetailResponse;
import backend.datn.dto.response.OrderResponse;
import backend.datn.dto.response.VoucherResponse;
import backend.datn.entities.*;
import backend.datn.exceptions.InsufficientStockException;
import backend.datn.exceptions.ResourceNotFoundException;
import backend.datn.mapper.OrderDetailMapper;
import backend.datn.mapper.OrderMapper;
import backend.datn.mapper.VoucherMapper;
import backend.datn.repositories.OrderDetailRepository;
import backend.datn.repositories.OrderRepository;
import backend.datn.repositories.ProductDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductDetailRepository productDetailRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Lấy danh sách đơn hàng với phân trang và tìm kiếm
     */

    public Page<OrderResponse> getAllOrders(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Nếu search không rỗng, thêm ký tự '%' vào đầu và cuối
        String formattedSearch = (search == null || search.isEmpty()) ? null : "%" + search.toLowerCase() + "%";

        Page<Order> orderPage = orderRepository.searchOrder(formattedSearch, pageable);
        return orderPage.map(OrderMapper::toOrderResponse);
    }

    /**
     * Lấy thông tin chi tiết đơn hàng theo ID
     */
    public OrderResponse getOrderById(int id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));
        return OrderMapper.toOrderResponse(order);
    }

    /**
     * Lấy đơn hàng kèm theo danh sách chi tiết đơn hàng
     */
    @Transactional
    public OrderResponse getOrderWithDetails(int orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        List<OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(OrderDetailMapper::toOrderDetailResponse).collect(Collectors.toList());

        OrderResponse response = OrderMapper.toOrderResponse(order);
        response.setOrderDetails(orderDetailResponses);

        return response;
    }

    /**
     * Tạo mới đơn hàng, kiểm tra số lượng tồn kho và áp dụng khuyến mãi, voucher
     * nếu có
     */
    @Transactional
    public Order createOrder(Customer customer, Employee employee, Voucher voucher, List<OrderDetail> orderDetails,
            int paymentMethod) {
        Order order = new Order();
        order.setEmployee(employee);
        order.setVoucher(voucher);
        order.setCustomer(customer);
        order.setOrderCode("ORD" + System.currentTimeMillis());
        order.setCreateDate(LocalDateTime.now());
        order.setStatusOrder(0);
        order.setPaymentMethod(paymentMethod);

        int totalAmount = 0;
        BigDecimal totalBill = BigDecimal.ZERO;
        List<ProductDetail> updatedProducts = new ArrayList<>();

        for (OrderDetail orderDetail : orderDetails) {
            ProductDetail productDetail = productDetailRepository.findById(orderDetail.getProductDetail().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy sản phẩm với ID: " + orderDetail.getProductDetail().getId()));

            if (productDetail.getQuantity() < orderDetail.getQuantity()) {
                throw new InsufficientStockException(
                        "Không đủ hàng trong kho: " + productDetail.getProductDetailCode());
            }

            productDetail.setQuantity(productDetail.getQuantity() - orderDetail.getQuantity());
            updatedProducts.add(productDetail);

            Promotion promotion = productDetail.getPromotion();
            BigDecimal finalPrice = productDetail.getSalePrice();

            if (promotion != null) {
                BigDecimal discountPercent = BigDecimal.valueOf(100 - promotion.getPromotionPercent())
                        .divide(BigDecimal.valueOf(100));
                finalPrice = finalPrice.multiply(discountPercent);
            }

            totalBill = totalBill.add(finalPrice.multiply(BigDecimal.valueOf(orderDetail.getQuantity())));
            totalAmount += orderDetail.getQuantity();
            orderDetail.setOrder(order);
        }

        if (voucher != null) {
            validateVoucher(voucher, totalBill);
            BigDecimal discount = totalBill
                    .multiply(BigDecimal.valueOf(voucher.getReducedPercent()).divide(BigDecimal.valueOf(100)));
            if (discount.compareTo(voucher.getMaxDiscount()) > 0) {
                discount = voucher.getMaxDiscount();
            }
            totalBill = totalBill.subtract(discount).max(BigDecimal.ZERO);
        }

        order.setTotalBill(totalBill);
        order.setTotalAmount(totalAmount);

        order = orderRepository.save(order);
        orderDetailRepository.saveAll(orderDetails);
        productDetailRepository.saveAll(updatedProducts);

        // Ghi log tạo đơn hàng
        auditLogService.log("Order", order.getId(), "CREATE", null,
                null, OrderMapper.toOrderResponse(order),
                "Tạo mới đơn hàng: " + order.getOrderCode());

        return order;
    }

    /**
     * Cập nhật trạng thái đơn hàng sau khi thanh toán
     */
    @Transactional
    public OrderResponse updateOrderStatusAfterPayment(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        if (order.getStatusOrder() == 5) {
            throw new RuntimeException("Đơn hàng đã được thanh toán trước đó!");
        }

        int oldStatus = order.getStatusOrder();
        order.setStatusOrder(5);
        order = orderRepository.save(order);

        // Ghi log
        auditLogService.log("Order", order.getId(), "UPDATE_STATUS", null,
                oldStatus, 5,
                "Cập nhật trạng thái hóa đơn sau thanh toán: " + order.getOrderCode());

        return OrderMapper.toOrderResponse(order);
    }

    /**
     * Kiểm tra điều kiện áp dụng voucher
     */
    private void validateVoucher(Voucher voucher, BigDecimal totalBill) {
        if (totalBill.compareTo(voucher.getMinCondition()) < 0) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng Voucher");
        }
    }

    @Transactional
    @Scheduled(fixedRate = 900000) // Chạy mỗi 15 phút
    public void cancelUnpaidOrders() {
        Instant now = Instant.now();
        Instant bankTransferDeadline = now.minus(Duration.ofHours(12)); // Hủy đơn hàng chuyển khoản sau 12 giờ
        Instant eWalletDeadline = now.minus(Duration.ofMinutes(30)); // Hủy đơn hàng ví điện tử sau 30 phút

        List<Order> expiredOrders = orderRepository.findUnpaidOrders(bankTransferDeadline, eWalletDeadline);

        if (!expiredOrders.isEmpty()) {
            for (Order order : expiredOrders) {
                int oldStatus = order.getStatusOrder();
                order.setStatusOrder(-1);
                orderRepository.save(order);

                auditLogService.log("Order", order.getId(), "SYSTEM_CANCEL", "SYSTEM",
                        oldStatus, -1, "Hệ thống tự động hủy đơn hàng do quá hạn thanh toán: " + order.getOrderCode());
            }
        }
    }

    @Transactional
    public OrderResponse toggleStatusOrder(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + id));

        int currentStatus = order.getStatusOrder();
        switch (currentStatus) {
            case 0:
                order.setStatusOrder(2);
                updateStock(order);
                break;
            case 1:
                order.setStatusOrder(5);
                break;
            case 2:
                order.setStatusOrder(3);
                break;
            case 3:
                order.setStatusOrder(4);
                break;
            case 4:
                order.setStatusOrder(5);
                break;
            case 5:
                order.setStatusOrder(8);
                break;
            case -1:
            case 8:
                throw new IllegalStateException("Không thể thay đổi trạng thái đơn hàng đã hoàn thành hoặc đã hủy.");
            default:
                throw new IllegalStateException("Trạng thái đơn hàng không hợp lệ.");
        }
        order = orderRepository.save(order);

        // Ghi log
        auditLogService.log("Order", order.getId(), "UPDATE_STATUS", null,
                currentStatus, order.getStatusOrder(),
                "Chuyển trạng thái hóa đơn: " + order.getOrderCode());

        return OrderMapper.toOrderResponse(order);
    }

    private void updateStock(Order order) {
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId());
        for (OrderDetail orderDetail : orderDetails) {
            ProductDetail productDetail = productDetailRepository.findById(orderDetail.getProductDetail().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy sản phẩm với ID: " + orderDetail.getProductDetail().getId()));
            if (productDetail.getQuantity() < orderDetail.getQuantity()) {
                throw new InsufficientStockException(
                        "Không đủ hàng trong kho: " + productDetail.getProductDetailCode());
            }
            productDetail.setQuantity(productDetail.getQuantity() - orderDetail.getQuantity());
            productDetailRepository.save(productDetail);
        }
    }

    @Transactional
    public OrderResponse updateOrderStatus(Integer id, int status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với id: " + id));

        if (status < -1 || status > 8) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
        }

        int oldStatus = order.getStatusOrder();
        order.setStatusOrder(status);
        order = orderRepository.save(order);

        // Ghi log
        auditLogService.log("Order", order.getId(), "UPDATE_STATUS", null,
                oldStatus, status,
                "Cập nhật trạng thái đơn hàng: " + order.getOrderCode());

        return OrderMapper.toOrderResponse(order);
    }

    // hoa don trong
    @Transactional
    public Order createEmptyOrder(Customer customer, Employee employee, Integer paymentMethod) {
        // Tạo một đơn hàng mới
        Order order = new Order();

        // Gán các giá trị bắt buộc cho đơn hàng
        order.setOrderCode(UUID.randomUUID().toString()); // Tạo mã đơn hàng duy nhất (orderCode)
        order.setCreateDate(LocalDateTime.now()); // Thời gian tạo đơn hàng
        order.setTotalAmount(0); // Tổng tiền ban đầu là 0
        order.setTotalBill(BigDecimal.ZERO); // Tổng hóa đơn ban đầu là 0

        // Gán các trường còn lại
        order.setCustomer(customer); // Gán khách hàng
        order.setEmployee(employee); // Gán nhân viên
        order.setPaymentMethod(paymentMethod); // Gán phương thức thanh toán
        order.setStatusOrder(3); // Trạng thái đơn hàng (ví dụ: Mới tạo, Chờ xử lý)

        // Lưu đơn hàng vào cơ sở dữ liệu
        order = orderRepository.save(order); // Lưu vào cơ sở dữ liệu thông qua repository

        auditLogService.log("Order", order.getId(), "CREATE_EMPTY", null,
                null, OrderMapper.toOrderResponse(order),
                "Tạo hóa đơn trống (chờ xử lý): " + order.getOrderCode());

        return order;
    }

    public Order findById(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        return order;
    }
}
