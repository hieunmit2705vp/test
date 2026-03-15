package backend.cnpm.mapper;


import backend.cnpm.dto.response.SleeveResponse;
import backend.cnpm.entities.Sleeve;

public class SleeveMapper {

    public static SleeveResponse toSleeveResponse(Sleeve sleeve) {
        return SleeveResponse.builder()
                .id(sleeve.getId())
                .sleeveName(sleeve.getSleeveName())
                .status(sleeve.getStatus())
                .build();
    }

}
