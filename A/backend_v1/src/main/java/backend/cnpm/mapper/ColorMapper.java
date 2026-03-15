package backend.cnpm.mapper;


import backend.cnpm.dto.response.ColorResponse;
import backend.cnpm.entities.Color;


public class ColorMapper {
    public static ColorResponse toColorResponse(Color color){
        return ColorResponse.builder()
                .id(color.getId())
                .name(color.getColorName())
                .status(color.getStatus())
                .build();
    }
}
