package backend.datn.services;

import backend.datn.dto.request.CustomerCreateRequest;
import backend.datn.dto.request.CustomerPasswordUpdateRequest;
import backend.datn.dto.request.CustomerUpdateRequest;
import backend.datn.dto.response.CustomerResponse;
import backend.datn.entities.Customer;
import backend.datn.exceptions.EntityAlreadyExistsException;
import backend.datn.exceptions.EntityNotFoundException;
import backend.datn.helpers.CodeGeneratorHelper;
import backend.datn.helpers.RandomHelper;
import backend.datn.mapper.CustomerMapper;
import backend.datn.repositories.CustomerRepository;
import backend.datn.repositories.EmployeeRepository;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class CustomerService {
    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MailService mailService;

    @Autowired
    private AuditLogService auditLogService;

    public Page<CustomerResponse> getAllCustomers(String search, int page, int size, String sortBy, String sortDir) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Customer> customers = customerRepository.searchCustomers(search, pageable);

        return customers.map(CustomerMapper::toCustomerResponse);
    }

    public CustomerResponse getCustomerById(int id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));
        return CustomerMapper.toCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerCreateRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new EntityAlreadyExistsException("Email đã tồn tại.");
        }
        if (employeeRepository.existsByPhone(request.getPhone())) {
            throw new EntityAlreadyExistsException("Số điện thoại đã tồn tại.");
        }
        if (employeeRepository.existsByUsername(request.getUsername())) {
            throw new EntityAlreadyExistsException("Tên đăng nhập đã tồn tại.");
        }

        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new EntityAlreadyExistsException("Tên đăng nhập đã tồn tại.");
        }

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new EntityAlreadyExistsException("Email đã tồn tại.");
        }

        if (employeeRepository.existsByPhone(request.getPhone())) {
            throw new EntityAlreadyExistsException("Số điện thoại đã tồn tại.");
        }

        Customer customer = new Customer();
        customer.setCustomerCode(CodeGeneratorHelper.generateCode("CUS"));
        customer.setFullname(request.getFullname());

        // Sử dụng CodeGeneratorHelper để tạo username duy nhất, giới hạn 8 ký tự
        String username = (request.getUsername() != null) ? request.getUsername()
                : CodeGeneratorHelper.generateCode("cus").substring(0, 10);
        while (customerRepository.existsByUsername(username)) {
            username = CodeGeneratorHelper.generateCode("cus").substring(0, 10);
        }
        customer.setUsername(username);

        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());

        customer.setCreateDate(Instant.now());

        // ✅ Thêm giá trị mặc định cho updateDate khi tạo mới
        customer.setUpdateDate(Instant.now());

        customer.setForgetPassword(false);
        customer.setStatus(true);

        String rawPassword = RandomHelper.generateRandomString(8);
        String hashedPassword = passwordEncoder.encode(rawPassword);
        customer.setPassword(hashedPassword);

        customer = customerRepository.save(customer);
        logger.info("Khách hàng đã lưu thành công với ID: {}", customer.getId());

        CustomerResponse response = CustomerMapper.toCustomerResponse(customer);
        auditLogService.log("Customer", customer.getId(), "CREATE", null,
                null, response, "Đăng ký khách hàng mới: " + customer.getUsername());

        logger.info("Response gửi về FE: {}", response); // 🔍 Kiểm tra lỗi trước khi gửi về FE

        mailService.sendNewPasswordMail(customer.getUsername(), customer.getEmail(), rawPassword);

        return response;
    }

    @Transactional
    public CustomerResponse updateCustomer(int id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + id));

        // Capture state
        CustomerResponse oldState = CustomerMapper.toCustomerResponse(customer);

        if (customerRepository.existsByEmailAndNotId(request.getEmail(), id)) {
            throw new EntityAlreadyExistsException("Email đã tồn tại.");
        }
        if (customerRepository.existsByPhoneAndNotId(request.getPhone(), id)) {
            throw new EntityAlreadyExistsException("Số điện thoại đã tồn tại.");
        }

        if (employeeRepository.existsByEmailAndNotId(request.getEmail(), id)) {
            throw new EntityAlreadyExistsException("Email đã tồn tại.");
        }
        if (employeeRepository.existsByPhoneAndNotId(request.getPhone(), id)) {
            throw new EntityAlreadyExistsException("Số điện thoại đã tồn tại.");
        }

        customer.setFullname(request.getFullname());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setUpdateDate(Instant.now());

        customer = customerRepository.save(customer);

        CustomerResponse newState = CustomerMapper.toCustomerResponse(customer);
        auditLogService.log("Customer", customer.getId(), "UPDATE", null,
                oldState, newState, "Cập nhật thông tin khách hàng: " + customer.getUsername());

        return newState;
    }

    @Transactional
    public CustomerResponse toggleStatusCustomer(int id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng với ID: " + id));

        boolean oldStatus = customer.getStatus();
        customer.setStatus(!oldStatus);
        customer = customerRepository.save(customer);

        CustomerResponse response = CustomerMapper.toCustomerResponse(customer);
        auditLogService.log("Customer", customer.getId(), "TOGGLE_STATUS", null,
                oldStatus, !oldStatus, "Đổi trạng thái khách hàng: " + customer.getUsername());

        return response;
    }

    @Transactional
    public CustomerResponse updatePassword(int id, CustomerPasswordUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàngvới id: " + id));

        // Kiểm tra xác nhận mật khẩu mới
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu không khớp.");
        }

        // Gán mật khẩu mới đã mã hóa
        String rawPassword = request.getNewPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);
        customer.setPassword(encodedPassword);
        customer.setUpdateDate(Instant.now());

        // Lưu vào DB
        customer = customerRepository.save(customer);

        auditLogService.log("Customer", customer.getId(), "UPDATE_PASSWORD", null,
                "********", "********", "Đổi mật khẩu cho khách hàng: " + customer.getUsername());

        return CustomerMapper.toCustomerResponse(customer);
    }

    public Optional<Customer> findById(@NotNull Integer customerId) {
        return customerRepository.findById(customerId);
    }

    // thêm khach hàng vãng lai
    public Customer getWalkInCustomer() {
        // Tạo một khách hàng vãng lai với thông tin mặc định
        Customer walkInCustomer = new Customer();
        walkInCustomer.setId(0); // ID giả định cho khách vãng lai
        walkInCustomer.setFullname("Khách Vãng Lai");
        walkInCustomer.setPhone("0000000000"); // Hoặc số điện thoại mặc định
        walkInCustomer.setEmail("walkin@customer.com"); // Email mặc định

        return walkInCustomer;
    }

}
