package backend.cnpm.dto.response.statistic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnifiedStatisticResponse {
    private String label;
    private BigDecimal revenue;
    private BigDecimal profit;
}
