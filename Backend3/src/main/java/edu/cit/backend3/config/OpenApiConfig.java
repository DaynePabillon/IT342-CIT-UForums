package edu.cit.backend3.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.servers.ServerVariable;
import io.swagger.v3.oas.models.servers.ServerVariables;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .openapi("3.0.1") // Explicitly set OpenAPI version
                .info(new Info()
                        .title("CIT Forums API")
                        .version("1.0.0")
                        .description("API documentation for CIT Forums application - a specialized forum platform for Cebu Institute of Technology University")
                        .contact(new Contact()
                                .name("CIT Forums Team")
                                .email("admin@citforums.com")
                                .url("https://citforums.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("{scheme}://localhost:8080")
                                .description("Local development server")
                                .variables(new ServerVariables()
                                        .addServerVariable("scheme", new ServerVariable()
                                                .default_("http")
                                                .enum_(Arrays.asList("http", "https"))
                                                .description("URI scheme"))),
                        new Server()
                                .url("{scheme}://it342-cit-uforums.onrender.com")
                                .description("Production server")
                                .variables(new ServerVariables()
                                        .addServerVariable("scheme", new ServerVariable()
                                                .default_("https")
                                                .enum_(Arrays.asList("http", "https"))
                                                .description("URI scheme")))
                ))
                .tags(Arrays.asList(
                        new Tag().name("Authentication").description("Operations related to user authentication and registration"),
                        new Tag().name("Forums").description("Operations for managing forums and categories"),
                        new Tag().name("Threads").description("Operations for managing discussion threads"),
                        new Tag().name("Posts").description("Operations for managing posts within threads"),
                        new Tag().name("Comments").description("Operations for managing comments on posts"),
                        new Tag().name("Users").description("Operations for user management"),
                        new Tag().name("Reports").description("Operations for content reporting and moderation"),
                        new Tag().name("Admin Dashboard").description("Administrative operations for system monitoring and management")
                ))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token authentication. Enter your token in the format: Bearer <token>"))
                )
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}