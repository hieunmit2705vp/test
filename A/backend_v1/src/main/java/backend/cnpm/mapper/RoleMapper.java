package backend.cnpm.mapper;

import backend.cnpm.dto.response.RoleResponse;
import backend.cnpm.entities.Role;


public class RoleMapper {
    public static RoleResponse toRoleResponse(Role role) {
        return RoleResponse.builder().
                id(role.getId()).
                name(role.getName()).
                build();
    }
}
