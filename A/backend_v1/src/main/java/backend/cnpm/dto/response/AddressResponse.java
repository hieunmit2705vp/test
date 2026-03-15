package backend.cnpm.dto.response;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
public class AddressResponse implements Serializable {
    Integer id;
    CustomerResponse customer;
    Integer provinceId;
    String provinceName;
    Integer districtId;
    String districtName;
    String wardId;
    String wardName;
    String addressDetail;
}
