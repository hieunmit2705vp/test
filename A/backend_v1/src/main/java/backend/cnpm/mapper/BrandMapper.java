package backend.cnpm.mapper;


import backend.cnpm.dto.response.BrandResponse;
import backend.cnpm.entities.Brand;

public class BrandMapper {

    public static BrandResponse toBrandResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .brandName(brand.getBrandName())
                .status(brand.getStatus())
                .build();
    }
}
