package backend.cnpm.mapper;

import backend.cnpm.dto.response.OrderPOSResponse;
import backend.cnpm.entities.OrderPOS;

public class OrderPOSMapper {

    public static OrderPOSResponse toOrderPOSResponse(OrderPOS orderPOS) {
        if (orderPOS == null) {
            return null;
        }

        return OrderPOSResponse.builder()
                .id(orderPOS.getId())
                .voucher(orderPOS.getVoucher() != null ? VoucherMapper.toVoucherResponse(orderPOS.getVoucher()) : null)
                .customer(orderPOS.getCustomer() != null ? CustomerMapper.toCustomerResponse(orderPOS.getCustomer()) : null)
                .employee(orderPOS.getEmployee() != null ? EmployeeMapper.toEmployeeResponse(orderPOS.getEmployee()) : null)
                .orderCode(orderPOS.getOrderCode() != null ? orderPOS.getOrderCode() : "")
                .createDate(orderPOS.getCreateDate())
                .originalTotal(orderPOS.getOriginalTotal())
                .totalAmount(orderPOS.getTotalAmount())
                .totalBill(orderPOS.getTotalBill())
                .paymentMethod(orderPOS.getPaymentMethod() != null ? orderPOS.getPaymentMethod() : 0)
                .statusOrder(orderPOS.getStatusOrder() != null ? orderPOS.getStatusOrder() : 0)
                .kindOfOrder(orderPOS.getKindOfOrder())
                .build();
    }
}
