package backend.cnpm.mapper;

import backend.cnpm.dto.response.CollarResponse;
import backend.cnpm.entities.Collar;

public class CollarMapper {
    public static CollarResponse toCollarResponse(Collar collar) {
        return CollarResponse.builder()
                .id(collar.getId())
                .name(collar.getCollarName())
                .status(collar.getStatus())
                .build();
    }
}
