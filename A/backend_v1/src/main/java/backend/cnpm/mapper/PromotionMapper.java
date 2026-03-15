package backend.cnpm.mapper;


import backend.cnpm.dto.response.PromotionResponse;
import backend.cnpm.entities.Promotion;

public class PromotionMapper {
    public static PromotionResponse toPromotionResponse(Promotion promotion) {
        return PromotionResponse.builder()
                .id(promotion.getId())
                .promotionName(promotion.getPromotionName())
                .promotionPercent(promotion.getPromotionPercent())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .description(promotion.getDescription())
                .status(promotion.getStatus())
                .build();
    }
}
