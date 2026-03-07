package backend.datn.security;

import backend.datn.entities.Customer;
import backend.datn.entities.Employee;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Integer id;
    private final String username;
    private final String password;
    private final String fullname;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean isEnabled;

    public CustomUserDetails(Employee employee) {
        this.id = employee.getId();
        this.username = employee.getUsername();
        this.password = employee.getPassword();
        this.fullname = employee.getFullname();
        this.isEnabled = employee.getStatus() == 1;
        this.authorities = Collections
                .singletonList(new SimpleGrantedAuthority("ROLE_" + employee.getRole().getName().toUpperCase()));
    }

    public CustomUserDetails(Customer customer) {
        this.id = customer.getId();
        this.username = customer.getUsername();
        this.password = customer.getPassword();
        this.fullname = customer.getFullname();
        this.isEnabled = customer.getStatus() != null && customer.getStatus();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
    }

    public Integer getId() {
        return id;
    }

    public String getFullname() {
        return fullname;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }
}
