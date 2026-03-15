package backend.cnpm.dto.response.statistic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class TopCustomerResponse {

    private Integer id;

    private String fullname;

    private String phone;

    private String email;

    private Integer totalOrders;

    private BigDecimal totalSpent;

}
