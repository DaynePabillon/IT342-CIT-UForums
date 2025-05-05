package edu.cit.backend3.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration for Swagger UI to ensure proper handling of resources and CORS
 */
@Configuration
public class SwaggerUIConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Add resource handlers for Swagger UI
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/4.15.5/")
                .resourceChain(false);
        
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/")
                .resourceChain(false);
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configure CORS specifically for Swagger UI endpoints
        registry.addMapping("/swagger-ui/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .maxAge(3600);
        
        registry.addMapping("/v3/api-docs/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .maxAge(3600);
        
        registry.addMapping("/swagger-resources/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .maxAge(3600);
    }
    
    // Additional configuration to ensure Swagger UI properly handles URL schemes
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                registry.addResourceHandler("/swagger-ui.html")
                        .addResourceLocations("classpath:/META-INF/resources/")
                        .resourceChain(false);
            }
            
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Allow CORS for Swagger UI HTML page
                registry.addMapping("/swagger-ui.html")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "HEAD", "OPTIONS")
                        .allowedHeaders("*")
                        .maxAge(3600);
            }
        };
    }
}
