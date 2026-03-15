package backend.cnpm.mapper;

import backend.cnpm.dto.response.CustomerAddressResponse;
import backend.cnpm.entities.Address;

public class CustomerAddressMapper {
    public static CustomerAddressResponse toAddressResponse(Address address) {
        return CustomerAddressResponse.builder()
                .id(address.getId())
                .provinceId(address.getProvinceId())
                .provinceName(address.getProvinceName())
                .districtId(address.getDistrictId())
                .districtName(address.getDistrictName())
                .wardId(address.getWardId())
                .wardName(address.getWardName())
                .addressDetail(address.getAddressDetail())
                .build();
    }
}
