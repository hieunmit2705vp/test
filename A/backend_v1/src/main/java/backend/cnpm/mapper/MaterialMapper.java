package backend.cnpm.mapper;


import backend.cnpm.dto.response.MaterialResponse;
import backend.cnpm.entities.Material;

public class MaterialMapper {

    public static MaterialResponse toMaterialResponse(Material material) {
        return MaterialResponse.builder()
                .id(material.getId())
                .materialName(material.getMaterialName())
                .status(material.getStatus())
                .build();
    }

}
