package edu.cit.citforums.security;

import edu.cit.citforums.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Legacy security configuration - Not used anymore.
 * Security configuration has been consolidated in WebSecurityConfig.
 * This class is kept for reference purposes only and does not provide
 * active security configuration anymore.
 * 
 * @deprecated This configuration is inactive. See WebSecurityConfig.
 */
@Deprecated
// Configuration annotation removed to prevent Spring from loading this class
public class LegacySecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /**
     * Legacy password encoder bean. 
     * Should not be active unless explicitly needed for backward compatibility.
     * 
     * @deprecated Use the passwordEncoder in WebSecurityConfig instead.
     */
    // @Bean(name = "legacyPasswordEncoder") - Disabled to prevent conflicts with the primary security config
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * This method is disabled and will not be used by Spring Security.
     * Security configuration has been consolidated in WebSecurityConfig.
     * 
     * @deprecated This method is not used anymore.
     */
    // @Bean - Bean annotation commented out to avoid conflicts
    // @Order(2)
    public SecurityFilterChain formLoginFilterChain(HttpSecurity http) throws Exception {
        // This configuration is no longer active
        http
            .securityMatcher("/auth/**", "/db-test/**", "/welcome/**", "/basic-login/**")
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests((authorize) -> authorize
                .requestMatchers("/css/**", "/js/**", "/images/**", "/error", "/basic-login.html").permitAll()
                .requestMatchers("/auth/**", "/db-test", "/welcome", "/basic-login").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/home")
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .permitAll()
            );

        return http.build();
    }
}
