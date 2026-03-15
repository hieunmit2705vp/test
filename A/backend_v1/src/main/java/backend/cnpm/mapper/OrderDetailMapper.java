package backend.cnpm.mapper;

import backend.cnpm.dto.response.OrderDetailResponse;
import backend.cnpm.entities.OrderDetail;
import org.springframework.stereotype.Component;

@Component
public class OrderDetailMapper {
    public static OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail) {
        if (orderDetail == null) return null;
        return OrderDetailResponse.builder()
                .id(orderDetail.getId())
                .order(orderDetail.getOrder() != null ? OrderMapper.toOrderResponse(orderDetail.getOrder()) : null)
                .productDetail(ProductDetailMapper.toProductDetailResponse(orderDetail.getProductDetail()))
                .price(orderDetail.getPrice())
                .importPrice(orderDetail.getImportPrice())
                .quantity(orderDetail.getQuantity())
                .build();
    }
}
