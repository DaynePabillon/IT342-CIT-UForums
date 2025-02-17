package edu.cit.CIT_UCommunityForums.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated())  // Require authentication for all endpoints
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/home", true)) // Redirect user after successful login
                .logout(logout -> logout
                        .logoutSuccessUrl("/")) // Redirect after logout
                .csrf(csrf -> csrf.disable()) // Disable CSRF (optional)
                .build();
    }
}
