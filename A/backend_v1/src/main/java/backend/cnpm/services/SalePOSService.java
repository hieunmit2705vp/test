package backend.cnpm.services;

import backend.cnpm.dto.request.OrderDetailCreateRequest;
import backend.cnpm.dto.request.OrderPOSCreateRequest;
import backend.cnpm.dto.response.OrderResponse;
import backend.cnpm.entities.*;
import backend.cnpm.mapper.OrderMapper;
import backend.cnpm.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

@Service
public class SalePOSService {

    private static final Logger logger = LoggerFactory.getLogger(SalePOSService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ProductDetailService productDetailService;

    @Autowired
    private VoucherService voucherService;
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private AuditLogService auditLogService;

    public Order findOrderById(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng #" + orderId));
    }

    /**
     * Tạo mới đơn hàng rỗng cho POS
     * Được sử dụng khi bắt đầu một giao dịch bán hàng tại quầy.
     */
    @Transactional
    public Order createEmptyOrder(Customer customer, Employee employee, Voucher voucher, Integer paymentMethod) {
        logger.info("Bắt đầu tạo đơn hàng. Customer ID: {}, Employee ID: {}, Voucher ID: {}, Payment Method: {}",
                (customer != null) ? customer.getId() : "Khách vãng lai",
                employee.getId(),
                (voucher != null) ? voucher.getId() : "Không có voucher",
                paymentMethod);

        if (employee == null || employeeService.findById(employee.getId()).isEmpty()) {
            throw new IllegalArgumentException("Nhân viên không tồn tại.");
        }

        if (voucher != null && voucherService.findById(voucher.getId()).isEmpty()) {
            throw new IllegalArgumentException("Voucher không tồn tại.");
        }

        if (paymentMethod == null || paymentMethod != 0) { // Chỉ chấp nhận tiền mặt (0)
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không hợp lệ. Tại quầy chỉ chấp nhận 0 (Tiền mặt).");
        }

        // Nếu khách hàng là null, gán khách hàng vãng lai (ID = -1)
        if (customer == null) {
            customer = new Customer();
            customer.setId(-1);
            customer.setFullname("Khách vãng lai");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setEmployee(employee);
        order.setVoucher(voucher);
        order.setPaymentMethod(paymentMethod);
        order.setStatusOrder(1);
        order.setKindOfOrder(true);
        order.setOrderDetails(new ArrayList<>());
        order.setTotalAmount(0);
        order.setTotalBill(BigDecimal.ZERO);
        order.setOriginalTotal(BigDecimal.ZERO);
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCreateDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        logger.info("Đã tạo đơn hàng. Order ID: {}, Order Code: {}", savedOrder.getId(), savedOrder.getOrderCode());

        // Ghi log lịch sử hệ thống
        auditLogService.log("Order", savedOrder.getId(), "CREATE",
                employee.getFullname(), null, savedOrder,
                "Tạo mới hóa đơn chờ POS: " + savedOrder.getOrderCode());

        return savedOrder;

    }

    /**
     * Thêm sản phẩm vào giỏ hàng của đơn hàng POS
     * Kiểm tra tồn kho trước khi thêm, cập nhật tổng tiền đơn hàng
     */
    public OrderResponse addProductToCart(Integer orderId, OrderDetailCreateRequest detailReq) {
        logger.info("Bắt đầu thêm sản phẩm vào giỏ hàng. Order ID: {}, Product Detail ID: {}, Quantity: {}",
                orderId, detailReq.getProductDetailId(), detailReq.getQuantity());

        // Tìm đơn hàng theo ID
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Tìm sản phẩm theo ID
        ProductDetail productDetail = productDetailService.findById(detailReq.getProductDetailId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy sản phẩm với ID: " + detailReq.getProductDetailId()));

        // Kiểm tra tồn kho trước khi thêm vào giỏ hàng (tránh cập nhật sai do giao dịch
        // đồng thời)
        synchronized (productDetail) {
            if (productDetail.getQuantity() < detailReq.getQuantity()) {
                logger.error("Sản phẩm {} không đủ hàng.", productDetail.getProduct().getProductName());
                throw new IllegalArgumentException(
                        "Sản phẩm " + productDetail.getProduct().getProductName() + " không đủ hàng!");
            }

            OrderDetail existingOrderDetail = order.getOrderDetails().stream()
                    .filter(od -> od.getProductDetail().getId().equals(detailReq.getProductDetailId()))
                    .findFirst()
                    .orElse(null);

            if (existingOrderDetail != null) {
                existingOrderDetail.setQuantity(existingOrderDetail.getQuantity() + detailReq.getQuantity());
                // Cập nhật giá mới nhất và giá vốn
                syncOrderDetailPrice(existingOrderDetail, productDetail);
                orderDetailRepository.save(existingOrderDetail);
                logger.info("Cập nhật số lượng sản phẩm trong giỏ hàng thành công. Order Detail ID: {}",
                        existingOrderDetail.getId());
            } else {
                OrderDetail newOrderDetail = new OrderDetail();
                newOrderDetail.setOrder(order);
                newOrderDetail.setProductDetail(productDetail);
                newOrderDetail.setQuantity(detailReq.getQuantity());

                // Đồng bộ giá và giá vốn ngay khi tạo mới
                syncOrderDetailPrice(newOrderDetail, productDetail);

                order.getOrderDetails().add(newOrderDetail);
                orderDetailRepository.save(newOrderDetail);
                logger.info("Thêm mới sản phẩm vào giỏ hàng thành công. Order Detail ID: {}", newOrderDetail.getId());
            }

            // Cập nhật tổng tiền (totalBill) và tổng số lượng (totalAmount) của đơn hàng
            // sau khi thêm sản phẩm vào giỏ hàng.
            updateOrderTotal(order);

            // Lưu đơn hàng sau khi cập nhật giỏ hàng
            Order savedOrder = orderRepository.save(order);
            OrderResponse orderResponse = OrderMapper.toOrderResponse(savedOrder);
            logger.info("Cập nhật tổng tiền và tổng số lượng thành công. Order ID: {}", order.getId());

            // Ghi log thêm sản phẩm
            auditLogService.log("Order", order.getId(), "ADD_PRODUCT",
                    order.getEmployee() != null ? order.getEmployee().getFullname() : "POS",
                    null, orderResponse,
                    "Thêm sản phẩm vào giỏ hàng POS: " + productDetail.getProduct().getProductName() + " (SL: "
                            + detailReq.getQuantity() + ")");

            return orderResponse;
        }
    }

    private void updateOrderTotal(Order order) {
        // Kiểm tra xem order có null không
        logger.info("📝 [DEBUG] Order nhận vào: {}", order);
        if (order == null) {
            logger.error("❌ [ERROR] Order bị null!");
            return;
        }

        // Kiểm tra xem danh sách orderDetails có null hoặc rỗng không
        logger.info("📝 [DEBUG] OrderDetails nhận vào: {}", order.getOrderDetails());
        if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
            logger.error("❌ [ERROR] OrderDetails null hoặc rỗng. Order ID: {}", order.getId());
            return;
        }

        BigDecimal originalTotal = BigDecimal.ZERO; // Tổng tiền chưa áp dụng giảm giá
        BigDecimal totalBill = BigDecimal.ZERO; // Tổng tiền sau khi áp khuyến mãi
        int totalAmount = 0;

        for (OrderDetail orderDetail : order.getOrderDetails()) {
            if (orderDetail == null || orderDetail.getProductDetail() == null) {
                continue;
            }

            ProductDetail productDetail = orderDetail.getProductDetail();

            // 🔥 QUAN TRỌNG: Đồng bộ lại giá và giá vốn (phòng trường hợp khuyến mãi hết
            // hạn hoặc giá thay đổi)
            syncOrderDetailPrice(orderDetail, productDetail);
            orderDetailRepository.save(orderDetail);

            BigDecimal price = orderDetail.getPrice();
            BigDecimal originalPrice = productDetail.getSalePrice();

            originalTotal = originalTotal.add(originalPrice.multiply(BigDecimal.valueOf(orderDetail.getQuantity())));
            totalBill = totalBill.add(price.multiply(BigDecimal.valueOf(orderDetail.getQuantity())));
            totalAmount += orderDetail.getQuantity();
        }

        // Kiểm tra và áp dụng Voucher nếu có
        if (order.getVoucher() != null) {
            Voucher voucher = order.getVoucher();
            if (!voucher.getStatus()) {
                logger.warn("⚠️ [VOUCHER] Voucher {} bị vô hiệu hóa", voucher.getVoucherCode());
            } else if (totalBill.compareTo(voucher.getMinCondition()) < 0) {
                logger.warn("⚠️ [VOUCHER] Đơn hàng không đủ điều kiện áp dụng voucher (yêu cầu: {}, hiện tại: {})",
                        voucher.getMinCondition(), totalBill);
            } else {
                BigDecimal beforeVoucher = totalBill;
                totalBill = voucherService.applyVoucher(voucher, totalBill);
                BigDecimal voucherDiscount = beforeVoucher.subtract(totalBill);

                logger.info("✅ [VOUCHER] Giá trước: {}, Voucher giảm: {}, Giá sau giảm: {}",
                        beforeVoucher, voucherDiscount, totalBill);
            }
        }

        // Gán lại giá trị cho order
        order.setOriginalTotal(originalTotal); // Thêm originalTotal vào order
        order.setTotalBill(totalBill);
        order.setTotalAmount(totalAmount);

        logger.info(
                "✅ [UPDATE ORDER] Order ID: {}, Trước giảm giá (originalTotal): {}, Sau khuyến mãi: {}, Sau voucher: {}, Tổng số lượng: {}",
                order.getId(), originalTotal, totalBill, totalBill, totalAmount);
    }

    /**
     * Cập nhật trạng thái đơn hàng sau khi thanh toán thành công.
     * Kiểm tra tồn kho trước khi trừ số lượng sản phẩm
     */
    @Transactional
    public OrderResponse updateOrderStatusAfterPayment(Integer orderId, Integer customerId, Integer voucherId) {
        logger.info(
                "Bắt đầu cập nhật trạng thái đơn hàng sau thanh toán. Order ID: {}, Customer ID: {}, Voucher ID: {}",
                orderId, customerId, voucherId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Kiểm tra nếu đơn hàng đã hoàn thành
        if (order.getStatusOrder() == 5) {
            throw new IllegalStateException("Đơn hàng đã được thanh toán trước đó!");
        }

        // Cập nhật customer và voucher nếu có giá trị mới
        if (customerId != null && customerId != order.getCustomer().getId()) {
            Customer customer = customerService.findById(customerId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + customerId));
            order.setCustomer(customer);
            logger.info("Cập nhật customer_id thành: {}", customerId);
        }
        if (voucherId != null && (order.getVoucher() == null || voucherId != order.getVoucher().getId())) {
            Voucher voucher = voucherService.findById(voucherId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy voucher với ID: " + voucherId));
            order.setVoucher(voucher);
            logger.info("Cập nhật voucher_id thành: {}", voucherId);
        }

        // Kiểm tra tồn kho trước khi trừ
        for (OrderDetail orderDetail : order.getOrderDetails()) {
            ProductDetail productDetail = orderDetail.getProductDetail();
            int quantity = productDetail.getQuantity();
            int orderedQuantity = orderDetail.getQuantity();

            if (quantity < orderedQuantity) {
                throw new IllegalArgumentException(
                        "Sản phẩm " + productDetail.getProduct().getProductName() + " không đủ hàng trong kho!");
            }

            productDetail.setQuantity(quantity - orderedQuantity);
            productDetailService.update(productDetail);

            logger.info("Cập nhật tồn kho sản phẩm: {} | Trước: {} | Sau: {} | Đã bán: {}",
                    productDetail.getProduct().getProductName(), quantity, productDetail.getQuantity(),
                    orderDetail.getQuantity());

        }

        // 🔥 Quan trọng: Cập nhật lại tổng tiền trước khi lưu đơn hàng
        updateOrderTotal(order);

        // Cập nhật trạng thái đơn hàng thành "Hoàn thành"
        Integer oldStatus = order.getStatusOrder();
        order.setStatusOrder(5);
        Order savedOrder = orderRepository.save(order);
        OrderResponse response = OrderMapper.toOrderResponse(savedOrder);

        logger.info("Thanh toán thành công! Order ID: {}, Tổng tiền: {}, Tổng số lượng: {}",
                order.getId(), order.getTotalBill(), order.getTotalAmount());

        // Ghi log lịch sử hệ thống
        auditLogService.log("Order", savedOrder.getId(), "PAYMENT",
                order.getEmployee().getFullname(), oldStatus, "HOÀN THÀNH",
                "Thanh toán thành công hóa đơn: " + savedOrder.getOrderCode());

        return response;
    }

    @Transactional
    public Order thanhToan(OrderPOSCreateRequest request) {
        if (request.getOrderId() == null) {
            logger.error("Order ID is null in request");
            throw new IllegalArgumentException("Order ID không được để trống.");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn."));

        // Cập nhật customerId
        if (request.getCustomerId() != null && request.getCustomerId() != order.getCustomer().getId()) {
            Customer customer = customerService.findById(request.getCustomerId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy khách hàng với ID: " + request.getCustomerId()));
            order.setCustomer(customer);
            logger.info("Cập nhật customer_id thành: {}", request.getCustomerId());
        }

        // Cập nhật voucherId
        if (request.getVoucherId() != null
                && (order.getVoucher() == null || request.getVoucherId() != order.getVoucher().getId())) {
            Voucher voucher = voucherService.findById(request.getVoucherId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy voucher với ID: " + request.getVoucherId()));
            order.setVoucher(voucher);
            logger.info("Cập nhật voucher_id thành: {}", request.getVoucherId());
        }

        // ✅ Cập nhật lại tổng tiền trước khi lưu đơn hàng
        updateOrderTotal(order);

        // Lưu lại hóa đơn đã cập nhật vào cơ sở dữ liệu
        return orderRepository.save(order);
    }

    private void syncOrderDetailPrice(OrderDetail orderDetail, ProductDetail productDetail) {
        BigDecimal price = productDetail.getSalePrice();
        Promotion promotion = productDetail.getPromotion();

        // Kiểm tra khuyến mãi còn hiệu lực không
        if (isPromotionActive(promotion)) {
            BigDecimal discountPercentage = BigDecimal.valueOf(promotion.getPromotionPercent())
                    .divide(BigDecimal.valueOf(100));
            BigDecimal discountAmount = price.multiply(discountPercentage);
            price = price.subtract(discountAmount);
        }

        orderDetail.setPrice(price);
        orderDetail.setImportPrice(
                productDetail.getImportPrice() != null ? productDetail.getImportPrice() : BigDecimal.ZERO);
    }

    private boolean isPromotionActive(Promotion promotion) {
        if (promotion == null || !promotion.getStatus()) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return !promotion.getStartDate().isAfter(now) && !promotion.getEndDate().isBefore(now);
    }

    private BigDecimal getDiscountedPrice(ProductDetail productDetail) {
        BigDecimal salePrice = productDetail.getSalePrice();
        if (isPromotionActive(productDetail.getPromotion())) {
            BigDecimal discountPercent = BigDecimal.valueOf(100 - productDetail.getPromotion().getPromotionPercent())
                    .divide(BigDecimal.valueOf(100), RoundingMode.HALF_UP);
            return salePrice.multiply(discountPercent);
        }
        return salePrice;
    }

    /**
     * Cập nhật phương thức thanh toán của đơn hàng
     */
    @Transactional
    public OrderResponse updatePaymentMethod(Integer orderId, Integer paymentMethod) {
        logger.info("Bắt đầu cập nhật phương thức thanh toán. Order ID: {}, Payment Method: {}", orderId,
                paymentMethod);

        // Tìm đơn hàng theo ID
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Capture old method
        Integer oldMethod = order.getPaymentMethod();

        // Kiểm tra xem đơn hàng có phải là đơn POS không
        if (!order.getKindOfOrder()) {
            logger.error(
                    "Không thể cập nhật phương thức thanh toán cho đơn hàng online qua chức năng POS. Order ID: {}",
                    orderId);
            throw new IllegalStateException("Chỉ có thể cập nhật phương thức thanh toán cho đơn hàng POS.");
        }

        // Kiểm tra trạng thái đơn hàng
        if (order.getStatusOrder() == 5 || order.getStatusOrder() == -1) {
            logger.error(
                    "Không thể cập nhật phương thức thanh toán cho đơn hàng đã hoàn thành hoặc đã hủy. Order ID: {}",
                    orderId);
            throw new IllegalStateException(
                    "Chỉ có thể cập nhật phương thức thanh toán cho đơn hàng chưa hoàn thành hoặc chưa bị hủy.");
        }

        // Kiểm tra phương thức thanh toán hợp lệ
        if (paymentMethod == null || paymentMethod != 0) {
            logger.error("Phương thức thanh toán không hợp lệ: {}. Order ID: {}", paymentMethod, orderId);
            throw new IllegalArgumentException(
                    "Phương thức thanh toán không hợp lệ. Tại quầy chỉ chấp nhận 0 (Tiền mặt).");
        }

        // Cập nhật phương thức thanh toán
        order.setPaymentMethod(paymentMethod);
        logger.info("Cập nhật phương thức thanh toán thành: {}", paymentMethod);

        // Lưu đơn hàng
        Order savedOrder = orderRepository.save(order);
        logger.info("Cập nhật phương thức thanh toán thành công. Order ID: {}, Payment Method: {}", orderId,
                paymentMethod);

        // Ghi log
        auditLogService.log("Order", order.getId(), "UPDATE_PAYMENT_METHOD",
                order.getEmployee() != null ? order.getEmployee().getFullname() : "POS",
                oldMethod, paymentMethod,
                "Cập nhật phương thức thanh toán cho hóa đơn: " + order.getOrderCode());

        return OrderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Hủy đơn hàng POS
     * 
     * @param orderId ID của đơn hàng cần hủy
     * @return OrderResponse chứa thông tin đơn hàng đã hủy
     */
    @Transactional
    public OrderResponse cancelOrder(Integer orderId) {
        logger.info("Bắt đầu hủy đơn hàng. Order ID: {}", orderId);

        // Tìm đơn hàng theo ID
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Kiểm tra xem đơn hàng có phải là đơn POS không
        if (!order.getKindOfOrder()) {
            logger.error("Không thể hủy đơn hàng online qua chức năng POS. Order ID: {}", orderId);
            throw new IllegalStateException("Chỉ có thể hủy đơn hàng POS.");
        }

        // Kiểm tra trạng thái đơn hàng
        if (order.getStatusOrder() != 1) {
            logger.error("Đơn hàng không ở trạng thái 'Chờ thanh toán'. Trạng thái hiện tại: {}. Order ID: {}",
                    order.getStatusOrder(), orderId);
            throw new IllegalStateException("Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ thanh toán'.");
        }

        int oldStatus = order.getStatusOrder();
        // Cập nhật trạng thái
        order.setStatusOrder(-1); // Đã hủy

        // Lưu đơn hàng
        Order savedOrder = orderRepository.save(order);
        logger.info("Hủy đơn hàng thành công. Order ID: {}, Trạng thái: -1", orderId);

        // Ghi log
        auditLogService.log("Order", order.getId(), "CANCEL",
                order.getEmployee() != null ? order.getEmployee().getFullname() : "POS",
                oldStatus, -1,
                "Hủy hóa đơn POS: " + order.getOrderCode());

        return OrderMapper.toOrderResponse(savedOrder);
    }

}
