package backend.datn.services;

import backend.datn.dto.request.LoginRequest;
import backend.datn.dto.request.RegisterRequest;
import backend.datn.dto.request.UpdateCurrentUserRequest;
import backend.datn.dto.response.AddressResponse;
import backend.datn.dto.response.LoginResponse;
import backend.datn.entities.Address;
import backend.datn.entities.Customer;
import backend.datn.entities.Employee;
import backend.datn.exceptions.EntityNotFoundException;
import backend.datn.helpers.CodeGeneratorHelper;
import backend.datn.mapper.AddressMapper;
import backend.datn.mapper.CustomerMapper;
import backend.datn.mapper.EmployeeMapper;
import backend.datn.repositories.AddressRepository;
import backend.datn.repositories.CustomerRepository;
import backend.datn.repositories.EmployeeRepository;
import backend.datn.security.CustomUserDetails;
import backend.datn.security.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private MailService mailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        // Tìm kiếm người dùng trong bảng Customer
        Customer customer = customerRepository.findByUsernameOrEmail(request.getUsername());
        if (customer != null) {
            // Kiểm tra mật khẩu đã mã hóa
            if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
                throw new BadCredentialsException("Invalid username or password");
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", "CUSTOMER");
            claims.put("fullName", customer.getFullname());
            claims.put("email", customer.getEmail());
            claims.put("phone", customer.getPhone());

            String token = jwtUtil.generateToken(customer.getUsername(), claims);
            return new LoginResponse(
                    token, customer.getUsername(), "CUSTOMER",
                    customer.getFullname(), customer.getEmail(),
                    customer.getPhone(), null, null, customer.getStatus());
        }

        // Tìm kiếm người dùng trong bảng Employee
        Employee employee = employeeRepository.findByUsernameOrEmail(request.getUsername());
        if (employee != null) {
            // Kiểm tra mật khẩu đã mã hóa
            if (!passwordEncoder.matches(request.getPassword(), employee.getPassword())) {
                throw new BadCredentialsException("Invalid username or password");
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", employee.getRole().getName());
            claims.put("fullName", employee.getFullname());
            claims.put("email", employee.getEmail());
            claims.put("phone", employee.getPhone());

            String token = jwtUtil.generateToken(employee.getUsername(), claims);
            return new LoginResponse(
                    token, employee.getUsername(), employee.getRole().getName(),
                    employee.getFullname(), employee.getEmail(),
                    employee.getPhone(), employee.getAddress(),
                    employee.getPhoto(), employee.getStatus() == 1);
        }

        // Nếu không tìm thấy, ném lỗi xác thực
        throw new BadCredentialsException("Invalid username or password");
    }

    public Map<String, Object> verifyToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new BadCredentialsException("Token is missing");
        }

        try {
            // Lấy username từ token
            String username = jwtUtil.extractUsername(token);

            // Kiểm tra token có hợp lệ không
            if (!jwtUtil.validateToken(token, username)) {
                throw new BadCredentialsException("Invalid or expired token");
            }

            // Lấy toàn bộ claims từ token
            return jwtUtil.extractAllClaims(token);
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid token: " + e.getMessage());
        }
    }

    public String register(RegisterRequest request) {
        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại.");
        }
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại.");
        }
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã tồn tại.");
        }

        // Tạo tài khoản Customer mới
        Customer customer = new Customer();
        customer.setCustomerCode(CodeGeneratorHelper.generateCode("CUS"));
        customer.setUsername(request.getUsername());
        customer.setFullname(null); // Hoặc có thể lấy từ request nếu có
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setStatus(true); // Kích hoạt luôn
        customer.setForgetPassword(false);
        customer.setCreateDate(java.time.Instant.now());

        customer = customerRepository.save(customer);

        // Ghi log
        auditLogService.log("Customer", customer.getId(), "REGISTER", customer.getUsername(),
                null, CustomerMapper.toCustomerResponse(customer),
                "Người dùng đăng ký tài khoản mới (Kích hoạt trực tiếp): " + customer.getUsername());

        return "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.";
    }

    public String confirmRegister(String token) {
        try {
            Claims claims = jwtUtil.extractAllClaims(token);

            String username = claims.get("username", String.class);
            String password = claims.get("password", String.class);
            String email = claims.get("email", String.class);
            String phone = claims.get("phone", String.class);

            if (customerRepository.existsByUsername(username)) {
                return "Tài khoản đã được xác nhận hoặc username đã tồn tại.";
            }

            Customer customer = new Customer();
            customer.setCustomerCode(CodeGeneratorHelper.generateCode("CUS"));
            customer.setUsername(username);
            customer.setFullname(null);
            customer.setPassword(password);
            customer.setEmail(email);
            customer.setPhone(phone);
            customer.setStatus(true);
            customer.setForgetPassword(false);

            customer = customerRepository.save(customer);

            // Ghi log
            auditLogService.log("Customer", customer.getId(), "REGISTER", customer.getUsername(),
                    null, CustomerMapper.toCustomerResponse(customer),
                    "Người dùng đăng ký tài khoản mới: " + customer.getUsername());

            return "Tài khoản đã được kích hoạt thành công!";
        } catch (Exception e) {
            return "Token không hợp lệ hoặc đã hết hạn.";
        }
    }

    // Bước 1: Người dùng yêu cầu quên mật khẩu
    public void handleForgotPassword(String usernameOrEmail) {
        String tempPassword = CodeGeneratorHelper.generateCode("TMP").substring(0, 8);

        // Kiểm tra Customer
        Customer customer = customerRepository.findByUsernameOrEmail(usernameOrEmail);
        if (customer != null) {
            sendForgotPasswordEmail(customer.getUsername(), customer.getEmail(), tempPassword);
            return;
        }

        // Kiểm tra Employee
        Employee employee = employeeRepository.findByUsernameOrEmail(usernameOrEmail);
        if (employee != null) {
            sendForgotPasswordEmail(employee.getUsername(), employee.getEmail(), tempPassword);
            return;
        }

        throw new EntityNotFoundException("Không tìm thấy tài khoản phù hợp.");
    }

    // Bước 2: Gửi email yêu cầu xác nhận quên mật khẩu
    private void sendForgotPasswordEmail(String username, String email, String tempPassword) {
        // Tạo token để gửi kèm
        Map<String, Object> claims = Map.of("newPassword", tempPassword);
        String token = jwtUtil.generateToken(username, claims);

        // Tạo đường dẫn xác nhận
        String confirmLink = "http://localhost:8080/auth/confirm-forgot-password?token=" + token;

        // Gửi email tạm thời
        mailService.sendTemporaryPasswordMail(username, email, tempPassword, confirmLink);
    }

    // Bước 3: API xác nhận và gửi mật khẩu tạm thời
    public void confirmForgotPassword(String token) {
        try {
            Claims claims = jwtUtil.extractAllClaims(token);
            String username = claims.getSubject();
            String newPassword = claims.get("newPassword", String.class);

            // Cập nhật mật khẩu mới cho Customer hoặc Employee
            if (updateCustomerPassword(username, newPassword)) {
                // Ghi log
                Customer customer = customerRepository.findByUsername(username);
                auditLogService.log("Customer", customer.getId(), "FORGOT_PASSWORD_RESET", customer.getUsername(),
                        "********", "********",
                        "Khôi phục mật khẩu qua email cho tài khoản: " + username);
                return;
            }
            if (updateEmployeePassword(username, newPassword)) {
                // Ghi log
                Employee employee = employeeRepository.findByUsername(username);
                auditLogService.log("Employee", employee.getId(), "FORGOT_PASSWORD_RESET", employee.getUsername(),
                        "********", "********",
                        "Khôi phục mật khẩu qua email cho nhân viên: " + username);
                return;
            }

            throw new EntityNotFoundException("Không thể xác nhận mật khẩu mới.");
        } catch (Exception e) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn.");
        }
    }

    private boolean updateCustomerPassword(String username, String newPassword) {
        Customer customer = customerRepository.findByUsername(username);
        if (customer != null) {
            customer.setPassword(passwordEncoder.encode(newPassword));
            customer.setForgetPassword(false);
            customerRepository.save(customer);
            return true;
        }
        return false;
    }

    private boolean updateEmployeePassword(String username, String newPassword) {
        Employee employee = employeeRepository.findByUsername(username);
        if (employee != null) {
            employee.setPassword(passwordEncoder.encode(newPassword));
            employee.setForgetPassword(false);
            employeeRepository.save(employee);
            return true;
        }
        return false;
    }

    public boolean resetTempAccounts() {
        String newPassword = passwordEncoder.encode("abc123");

        boolean updated = false;

        // Cập nhật mật khẩu cho admin
        Employee admin = employeeRepository.findByUsername("admin");
        if (admin != null) {
            admin.setPassword(newPassword);
            employeeRepository.save(admin);
            updated = true;
        }

        // Cập nhật mật khẩu cho staff
        Employee staff = employeeRepository.findByUsername("staff");
        if (staff != null) {
            staff.setPassword(newPassword);
            employeeRepository.save(staff);
            updated = true;
        }

        // Cập nhật mật khẩu cho user
        Customer user = customerRepository.findByUsername("user");
        if (user != null) {
            user.setPassword(newPassword);
            customerRepository.save(user);
            updated = true;
        }

        return updated;
    }

    public Object getCurrentUserInfo() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!(principal instanceof CustomUserDetails)) {
            throw new BadCredentialsException("Người dùng chưa đăng nhập hoặc thông tin xác thực không hợp lệ");
        }

        CustomUserDetails userDetails = (CustomUserDetails) principal;
        String username = userDetails.getUsername();

        Customer customer = customerRepository.findByUsername(username);
        if (customer != null) {
            return CustomerMapper.toCustomerResponse(customer);
        }

        Employee employee = employeeRepository.findByUsername(username);
        if (employee != null) {
            return EmployeeMapper.toEmployeeResponse(employee);
        }

        throw new EntityNotFoundException("Không tìm thấy thông tin tài khoản");
    }

    public List<AddressResponse> getCurrentUserAddresses() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("\n\n\nPrincipal : " + principal);

        if (!(principal instanceof CustomUserDetails)) {
            throw new BadCredentialsException("Người dùng chưa đăng nhập hoặc thông tin xác thực không hợp lệ");
        }

        CustomUserDetails userDetails = (CustomUserDetails) principal;

        String username = userDetails.getUsername();
        Customer customer = customerRepository.findByUsername(username);

        List<Address> addresses = addressRepository.findByCustomer(customer);

        if (addresses.isEmpty()) {
            return null;
        }

        return addresses.stream()
                .map(AddressMapper::toAddressResponse)
                .toList();
    }

    public Object updateCurrentUser(@Valid UpdateCurrentUserRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof CustomUserDetails)) {
            throw new BadCredentialsException("Người dùng chưa đăng nhập hoặc thông tin xác thực không hợp lệ");
        }

        CustomUserDetails userDetails = (CustomUserDetails) principal;
        String username = userDetails.getUsername();

        Customer customer = customerRepository.findByUsername(username);
        if (customer == null) {
            throw new EntityNotFoundException("Không tìm thấy thông tin khách hàng");
        }

        // Capture old state
        Object oldState = CustomerMapper.toCustomerResponse(customer);

        // Kiểm tra email và phone không trùng với người dùng khác
        if (customerRepository.existsByEmailAndNotId(request.getEmail(), customer.getId())) {
            throw new RuntimeException("Email đã tồn tại.");
        }
        if (customerRepository.existsByPhoneAndNotId(request.getPhone(), customer.getId())) {
            throw new RuntimeException("Số điện thoại đã tồn tại.");
        }

        // Cập nhật thông tin
        customer.setFullname(request.getFullname());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        customer.setUpdateDate(java.time.Instant.now());

        customer = customerRepository.save(customer);

        // Ghi log
        auditLogService.log("Customer", customer.getId(), "UPDATE_PROFILE", customer.getUsername(),
                oldState, CustomerMapper.toCustomerResponse(customer),
                "Người dùng tự cập nhật thông tin cá nhân: " + customer.getUsername());

        return CustomerMapper.toCustomerResponse(customer);
    }
}
