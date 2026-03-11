package backend.datn.dto.response.statistic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodStatisticResponse {
    private BigDecimal revenue;
    private BigDecimal profit;
    private Long orderCount;
    private Long inStoreOrderCount;
    private Long onlineOrderCount;
}
