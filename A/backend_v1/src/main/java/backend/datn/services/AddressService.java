package backend.datn.services;

import backend.datn.dto.request.AddressCreateRequest;
import backend.datn.dto.response.AddressResponse;
import backend.datn.entities.Address;
import backend.datn.entities.Customer;
import backend.datn.exceptions.EntityNotFoundException;
import backend.datn.mapper.AddressMapper;
import backend.datn.repositories.AddressRepository;
import backend.datn.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AuditLogService auditLogService;

    public AddressResponse getById(Integer id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Địa chỉ không tồn tại"));
        return AddressMapper.toAddressResponse(address);
    }

    public List<AddressResponse> getByCustomerId(String customerId) {
        List<Address> addresses = addressRepository.findByCustomerId(customerId);
        return addresses.stream()
                .map(AddressMapper::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse create(AddressCreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Khách hàng không tồn tại"));

        Address address = new Address();
        address.setCustomer(customer);
        address.setProvinceId(request.getProvinceId());
        address.setProvinceName(request.getProvinceName());
        address.setDistrictId(request.getDistrictId());
        address.setDistrictName(request.getDistrictName());
        address.setWardId(request.getWardId());
        address.setWardName(request.getWardName());
        address.setAddressDetail(request.getAddressDetail());
        address = addressRepository.save(address);

        AddressResponse response = AddressMapper.toAddressResponse(address);
        auditLogService.log("Address", address.getId(), "CREATE", null,
                null, response, "Thêm địa chỉ mới cho khách hàng: " + customer.getUsername());

        return response;
    }

    @Transactional
    public AddressResponse update(Integer id, AddressCreateRequest request) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Địa chỉ không tồn tại"));

        // Capture state
        AddressResponse oldState = AddressMapper.toAddressResponse(address);

        address.setProvinceId(request.getProvinceId());
        address.setProvinceName(request.getProvinceName());
        address.setDistrictId(request.getDistrictId());
        address.setDistrictName(request.getDistrictName());
        address.setWardId(request.getWardId());
        address.setWardName(request.getWardName());
        address.setAddressDetail(request.getAddressDetail());

        address = addressRepository.save(address);

        AddressResponse newState = AddressMapper.toAddressResponse(address);
        auditLogService.log("Address", address.getId(), "UPDATE", null,
                oldState, newState, "Cập nhật địa chỉ: " + address.getAddressDetail());

        return newState;
    }

    @Transactional
    public void delete(Integer id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Địa chỉ không tồn tại"));

        AddressResponse oldState = AddressMapper.toAddressResponse(address);
        addressRepository.delete(address);

        auditLogService.log("Address", id, "DELETE", null,
                oldState, null, "Xóa địa chỉ: " + address.getAddressDetail());
    }
}
