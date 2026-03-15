package backend.cnpm.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SleeveUpdateRequest implements Serializable {
    @NotNull
    Integer id;

    @NotNull(message = "Vui lòng điền thông tin tên tay áo")
    String sleeveName;
}
