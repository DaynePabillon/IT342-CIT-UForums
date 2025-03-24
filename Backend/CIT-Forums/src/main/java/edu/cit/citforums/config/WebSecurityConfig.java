package edu.cit.citforums.config;

import edu.cit.citforums.security.JwtAuthenticationFilter;
import edu.cit.citforums.service.CustomUserDetailsService;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Primary
public class WebSecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

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
            .cors(cors -> cors.configure(http))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Legacy paths
                .requestMatchers("/auth/**", "/db-test/**", "/welcome/**", "/basic-login/**").permitAll()
                // API Auth paths
                .requestMatchers("/api/auth/**").permitAll()
                // Forum endpoints - allow authenticated users to create forums
                .requestMatchers(HttpMethod.GET, "/api/forums/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/forums").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/forums/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/forums/**").authenticated()
                // Thread endpoints
                .requestMatchers(HttpMethod.GET, "/api/threads/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/threads/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/threads/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/threads/**").authenticated()
                // Static resources
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**", "/favicon.ico", "/*/favicon.ico").permitAll()
                // Swagger UI
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**").permitAll()
                // Actuator endpoints
                .requestMatchers("/actuator/**").permitAll()
                // Thymeleaf views for backward compatibility
                .requestMatchers("/", "/error", "/login", "/register").permitAll()
                // Frontend static files
                .requestMatchers("/*.js", "/*.css", "/*.html", "/*.json", "/*.ico", "/static/**").permitAll()
                // Protected URLs
                .anyRequest().authenticated())
            // Configure login (for backward compatibility)
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/home")
                .failureUrl("/login?error=true")
                .permitAll())
            // Configure logout
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .permitAll());

        // Add JWT filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
} 