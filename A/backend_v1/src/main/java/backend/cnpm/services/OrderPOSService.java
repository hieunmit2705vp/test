package backend.cnpm.services;

import backend.cnpm.dto.response.OrderDetailResponse;
import backend.cnpm.dto.response.OrderPOSResponse;
import backend.cnpm.entities.OrderDetail;
import backend.cnpm.entities.OrderPOS;
import backend.cnpm.exceptions.EntityNotFoundException;
import backend.cnpm.mapper.OrderDetailMapper;
import backend.cnpm.mapper.OrderPOSMapper;
import backend.cnpm.repositories.OrderDetailRepository;
import backend.cnpm.repositories.OrderPOSRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderPOSService {

    @Autowired
    private OrderPOSRepository orderPOSRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    /**
     * Lấy danh sách hóa đơn POS với tìm kiếm và phân trang
     *
     * @param search        Từ khóa tìm kiếm (có thể null)
     * @param page          Số trang (bắt đầu từ 0)
     * @param size          Kích thước trang
     * @param sortKey       Trường sắp xếp
     * @param sortDirection Hướng sắp xếp (asc/desc)
     * @return Page<OrderPOSResponse> Danh sách hóa đơn POS đã phân trang
     */
    public Page<OrderPOSResponse> getAllPOSOrders(String search, Integer status, int page, int size, String sortKey,
            String sortDirection) {
        // Xác định hướng sắp xếp (ascending hoặc descending)
        Sort sort = sortDirection.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortKey).ascending()
                : Sort.by(sortKey).descending();

        // Tạo đối tượng Pageable từ page, size và sort
        Pageable pageable = PageRequest.of(page, size, sort);

        // Chỉ lấy hóa đơn POS (kindOfOrder = true)
        Page<OrderPOS> posOrders = orderPOSRepository.findAllByKindOfOrderWithSearchAndJoin(true, search, status,
                pageable);

        // Ánh xạ sang OrderPOSResponse
        return posOrders.map(OrderPOSMapper::toOrderPOSResponse);
    }

    /**
     * Tìm hóa đơn POS theo ID
     *
     * @param id ID của đơn hàng
     * @return OrderPOSResponse hoặc null nếu không tìm thấy
     */
    public OrderPOSResponse getPOSOrderById(Integer id) {
        Optional<OrderPOS> orderOpt = orderPOSRepository.findOrderPOSByIdWithKindOfOrder(id, true);
        return orderOpt.map(OrderPOSMapper::toOrderPOSResponse).orElse(null);
    }

    /**
     * Lấy chi tiết hóa đơn POS kèm danh sách sản phẩm
     */
    @Transactional
    public OrderPOSResponse getOrderPOSDetails(Integer orderId) {
        // Tìm đơn hàng POS theo ID với kindOfOrder = true
        OrderPOS order = orderPOSRepository.findOrderPOSByIdWithKindOfOrder(orderId, true)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng POS với ID: " + orderId));

        // Lấy danh sách chi tiết đơn hàng
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(orderId);
        List<OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(OrderDetailMapper::toOrderDetailResponse)
                .collect(Collectors.toList());

        // Ánh xạ sang OrderPOSResponse và thêm danh sách chi tiết
        OrderPOSResponse response = OrderPOSMapper.toOrderPOSResponse(order);
        response.setOrderDetails(orderDetailResponses);

        return response;
    }

}
