package backend.cnpm.mapper;

import backend.cnpm.dto.response.OrderOnlineDetailResponse;
import backend.cnpm.entities.OrderOnlineDetail;
import org.springframework.stereotype.Component;

@Component
public class OrderDetailOnlineMapper {
    public static OrderOnlineDetailResponse toOrderDetailResponse(OrderOnlineDetail orderDetail) {
        if (orderDetail == null)
            return null;
        return OrderOnlineDetailResponse.builder()
                .id(orderDetail.getId())
                .order(OrderOnlineMapper.toOrderOnlineResponse(orderDetail.getOrder()))
                .productDetail(ProductDetailMapper.toProductDetailResponse(orderDetail.getProductDetail()))
                .price(orderDetail.getPrice())
                .importPrice(orderDetail.getImportPrice())
                .quantity(orderDetail.getQuantity())
                .build();
    }
}
