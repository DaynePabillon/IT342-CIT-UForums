package edu.cit.citforums.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

/**
 * Legacy security configuration - Not used anymore.
 * Security configuration has been consolidated in WebSecurityConfig.
 * This class is kept for reference purposes only and does not provide
 * active security configuration anymore.
 * 
 * @deprecated This configuration is inactive. See WebSecurityConfig.
 */
@Deprecated
// @Configuration - Commented out to avoid conflicts
// @EnableWebSecurity - Commented out to avoid conflicts
public class SecurityConfig {
    // All configuration has been moved to WebSecurityConfig
} 