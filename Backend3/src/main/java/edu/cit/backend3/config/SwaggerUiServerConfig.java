package edu.cit.backend3.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration to ensure Swagger UI uses the correct server URL
 */
@Configuration
public class SwaggerUiServerConfig implements WebMvcConfigurer {

    @Value("${server.port:8080}")
    private String serverPort;

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect to Swagger UI
        registry.addRedirectViewController("/api/docs", "/swagger-ui.html");
    }

    /**
     * Configure Swagger UI to use the correct server URL
     */
    @Bean
    @Primary
    public WebMvcConfigurer swaggerUiConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                // Set up redirects for Swagger UI
                registry.addViewController("/swagger-ui/")
                        .setViewName("forward:/swagger-ui/index.html");
                registry.addViewController("/swagger-ui")
                        .setViewName("forward:/swagger-ui/index.html");
            }
        };
    }
}
