package backend.cnpm.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import jakarta.validation.constraints.Email;

@Data
public class EmployeeCreateRequest {

    @NotNull(message = "ID vai trò không được để trống")
    String roleId;

    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    String fullname;

    @NotNull(message = "Tên đăng nhập không được để trống")
    @Size(max = 100, message = "Tên đăng nhập không được vượt quá 100 ký tự")
    String username;

    @Email(message = "Email phải hợp lệ")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    String email;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    String phone;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    String address;

    String photo;

    @NotNull(message = "Giới tính không được để trống")
    Boolean gender;

}
