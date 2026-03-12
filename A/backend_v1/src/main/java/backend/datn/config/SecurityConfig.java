package backend.datn.config;

import backend.datn.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationProvider;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, UserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF (nếu dùng API)
                .cors(cors -> cors.configure(http))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll() // Cho phép không cần token
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll() // Swagger UI
                        .requestMatchers(HttpMethod.GET,"/api/products/**").permitAll() // Cho phép không cần token
                        .requestMatchers("/api/account/**").authenticated()
                        .requestMatchers(HttpMethod.GET,"/api/product-details/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/brand/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/sizes/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/sleeve/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/colors/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/collars/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/vouchers/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/addresses/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/api/addresses/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/customers/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers(HttpMethod.POST,"/api/customers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,"/api/addresses/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/order/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api//orders/online/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/v1/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/products/**").permitAll()

                        // --- Restricted for ADMIN ONLY ---
                        // --- Restricted for ADMIN ONLY (Modifications) ---
                        .requestMatchers(HttpMethod.POST, "/api/vouchers/**", "/api/brand/**", "/api/material/**", 
                                       "/api/categories/**", "/api/colors/**", "/api/collars/**", 
                                       "/api/sizes/**", "/api/sleeve/**", "/api/promotion/**", "/api/customers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/vouchers/**", "/api/brand/**", "/api/material/**", 
                                       "/api/categories/**", "/api/colors/**", "/api/collars/**", 
                                       "/api/sizes/**", "/api/sleeve/**", "/api/promotion/**", "/api/customers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vouchers/**", "/api/brand/**", "/api/material/**", 
                                       "/api/categories/**", "/api/colors/**", "/api/collars/**", 
                                       "/api/sizes/**", "/api/sleeve/**", "/api/promotion/**", "/api/customers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/vouchers/**", "/api/brand/**", "/api/material/**", 
                                       "/api/categories/**", "/api/colors/**", "/api/collars/**", 
                                       "/api/sizes/**", "/api/sleeve/**", "/api/promotion/**", "/api/customers/**").hasRole("ADMIN")

                        .requestMatchers("/api/statistics/**").hasRole("ADMIN")
                        .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                        .requestMatchers("/api/employees/**").hasRole("ADMIN")
                        
                         // Product Modification
                        .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/product-details/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/product-details/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/product-details/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/**", "/api/product-details/**").hasRole("ADMIN")

                        // --- Shared for ADMIN & STAFF (Viewing & Others) ---
                        .requestMatchers(HttpMethod.GET, "/api/vouchers/**", "/api/brand/**", "/api/material/**", 
                                       "/api/categories/**", "/api/colors/**", "/api/collars/**", 
                                       "/api/sizes/**", "/api/sleeve/**", "/api/promotion/**").hasAnyRole("ADMIN", "STAFF")

                        // --- Shared for ADMIN & STAFF ---
                        .requestMatchers("/api/**").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/cart/**").hasAnyRole("CUSTOMER")
                        .anyRequest().permitAll()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Không lưu session
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(List.of(authenticationProvider()));
    }
}
