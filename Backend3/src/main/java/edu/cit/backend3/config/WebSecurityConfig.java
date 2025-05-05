package edu.cit.backend3.config;

import edu.cit.backend3.security.JwtAuthenticationFilter;
import edu.cit.backend3.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Primary
public class WebSecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private SimpleCorsFilter simpleCorsFilter;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "https://it342-cit-uforums-site.onrender.com", 
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    @Primary
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/forums/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/threads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                // Member endpoints
                .requestMatchers("/api/members/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/threads/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/comments/**").authenticated()
                // Swagger UI and API docs
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/swagger-ui-standalone.html").permitAll()
                .requestMatchers("/openapi.json").permitAll()
                .requestMatchers("/openapi/**").permitAll()
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Static resources
                .requestMatchers("/", "/error", "/login", "/register", "/manifest.json", "/favicon.ico").permitAll()
                .requestMatchers("/*.js", "/*.css", "/*.html", "/*.json", "/*.ico", "/static/**", "/assets/**").permitAll()
                // Protected URLs
                .anyRequest().authenticated())
            .addFilterBefore(simpleCorsFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return org.springframework.security.crypto.password.NoOpPasswordEncoder.getInstance();
    }
}