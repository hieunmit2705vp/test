package backend.cnpm.mapper;

import backend.cnpm.dto.response.CategoryResponse;
import backend.cnpm.entities.Category;


public class CategoryMapper {
    public static CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getCategoryName())
                .status(category.getStatus())
                .build();
    }
}
