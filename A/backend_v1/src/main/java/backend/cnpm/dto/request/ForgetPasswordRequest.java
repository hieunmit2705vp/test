package backend.cnpm.dto.request;

import lombok.Data;

@Data
public class ForgetPasswordRequest {
    private String usernameOrEmail;
}
