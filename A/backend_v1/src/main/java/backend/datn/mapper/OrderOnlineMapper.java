package backend.datn.mapper;

import backend.datn.dto.response.OrderOnlineResponse;
import backend.datn.entities.OrderOnline;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderOnlineMapper {
    public static OrderOnlineResponse toOrderOnlineResponse(OrderOnline order) {
        if (order == null) return null;
        return OrderOnlineResponse.builder()
                .id(order.getId() != null ? Math.toIntExact(order.getId()) : 0)
                .voucher(order.getVoucher() != null ? VoucherMapper.toVoucherResponse(order.getVoucher()) : null)
                .customer(order.getCustomer() != null ? CustomerMapper.toCustomerResponse(order.getCustomer()) : null)
                .orderCode(order.getOrderCode() != null ? order.getOrderCode() : "")
                .createDate(order.getCreateDate())
                .totalAmount(order.getTotalAmount())
                .originalTotal(
                        (order.getOriginalTotal() == null || order.getOriginalTotal().compareTo(BigDecimal.ZERO) == 0)
                                ? order.getTotalBill().subtract(order.getShipfee() != null ? order.getShipfee() : BigDecimal.ZERO)
                                : order.getOriginalTotal()
                )
                .totalBill(order.getTotalBill())
                .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : 0)
                .statusOrder(order.getStatusOrder() != null ? order.getStatusOrder() : 0)
                .kindOfOrder(order.getKindOfOrder())
                .phone(order.getPhone() != null ? order.getPhone() : "")
                .address(order.getAddress() != null ? order.getAddress() : "")
                .shipfee(order.getShipfee() != null ? order.getShipfee() : BigDecimal.ZERO)
                .discount(order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO)
                .build();
    }
}
