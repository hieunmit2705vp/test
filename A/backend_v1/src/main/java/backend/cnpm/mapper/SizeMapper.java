package backend.cnpm.mapper;

import backend.cnpm.dto.response.SizeResponse;
import backend.cnpm.entities.Size;


public class SizeMapper {
    public static SizeResponse toSizeResponse(Size size){
        return SizeResponse.builder()
                .id(size.getId())
                .name(size.getSizeName())
                .status(size.getStatus())
                .build();
    }
}
