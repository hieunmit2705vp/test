package backend.cnpm.services;

import backend.cnpm.dto.request.CustomerAddressRequest;
import backend.cnpm.dto.request.UpdateCustomerInfomationRequest;
import backend.cnpm.dto.request.UpdateCustomerPasswordRequest;
import backend.cnpm.dto.response.CustomerAddressResponse;
import backend.cnpm.dto.response.CustomerResponse;
import backend.cnpm.entities.Address;
import backend.cnpm.entities.Customer;
import backend.cnpm.exceptions.EntityNotFoundException;
import backend.cnpm.mapper.CustomerAddressMapper;
import backend.cnpm.mapper.CustomerMapper;
import backend.cnpm.repositories.AddressRepository;
import backend.cnpm.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import backend.cnpm.security.CustomUserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UpdateAccountService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private AuditLogService auditLogService;

    private Customer getCurrentCustomer() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!(principal instanceof CustomUserDetails)) {
            throw new BadCredentialsException("Người dùng chưa đăng nhập hoặc thông tin xác thực không hợp lệ");
        }

        String username = ((CustomUserDetails) principal).getUsername();
        Customer customer = customerRepository.findByUsername(username);

        if (customer == null) {
            throw new EntityNotFoundException("Không tìm thấy tài khoản khách hàng");
        }

        return customer;
    }

    @Transactional
    public CustomerResponse updateCustomerInfo(UpdateCustomerInfomationRequest request) {
        Customer customer = getCurrentCustomer();

        // Capture state
        CustomerResponse oldState = CustomerMapper.toCustomerResponse(customer);

        customer.setFullname(request.getFullname());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customerRepository.save(customer);

        CustomerResponse newState = CustomerMapper.toCustomerResponse(customer);
        auditLogService.log("Customer", customer.getId(), "UPDATE_PROFILE", null,
                oldState, newState, "Cập nhật thông tin cá nhân: " + customer.getUsername());

        return newState;
    }

    @Transactional
    public void updateCustomerPassword(UpdateCustomerPasswordRequest request) {
        Customer customer = getCurrentCustomer();
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        customer.setPassword(encodedPassword);
        customerRepository.save(customer);

        auditLogService.log("Customer", customer.getId(), "CHANGE_PASSWORD", null,
                "********", "********", "Khách hàng đổi mật khẩu: " + customer.getUsername());
    }

    public List<CustomerAddressResponse> getCurrentCustomerAddresses() {
        Customer customer = getCurrentCustomer();
        List<Address> addresses = addressRepository.findByCustomer(customer);
        return addresses.stream()
                .map(CustomerAddressMapper::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerAddressResponse createAddress(CustomerAddressRequest request) {
        Customer customer = getCurrentCustomer();

        Address address = new Address();
        address.setCustomer(customer);
        address.setProvinceId(request.getProvinceId());
        address.setProvinceName(request.getProvinceName());
        address.setDistrictId(request.getDistrictId());
        address.setDistrictName(request.getDistrictName());
        address.setWardId(request.getWardId());
        address.setWardName(request.getWardName());
        address.setAddressDetail(request.getAddressDetail());

        Address saved = addressRepository.save(address);

        CustomerAddressResponse response = CustomerAddressMapper.toAddressResponse(saved);
        auditLogService.log("Address", saved.getId(), "CREATE", null,
                null, response, "Khách hàng thêm địa chỉ mới: " + saved.getAddressDetail());

        return response;
    }

    @Transactional
    public void deleteAddress(Integer addressId) {
        Customer customer = getCurrentCustomer();
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy địa chỉ"));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new BadCredentialsException("Không có quyền xóa địa chỉ này");
        }

        CustomerAddressResponse oldState = CustomerAddressMapper.toAddressResponse(address);
        addressRepository.delete(address);

        auditLogService.log("Address", addressId, "DELETE", null,
                oldState, null, "Khách hàng xóa địa chỉ: " + address.getAddressDetail());
    }

}
