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
        OpenAPI openAPI = new OpenAPI();
        openAPI.openapi("3.0.1"); // Explicitly set OpenAPI version

        Info info = new Info();
        info.title("CIT Forums API");
        info.version("1.0.0");
        info.description("API documentation for CIT Forums application - a specialized forum platform for Cebu Institute of Technology University");

        Contact contact = new Contact();
        contact.name("CIT Forums Team");
        contact.email("admin@citforums.com");
        contact.url("https://citforums.com");
        info.contact(contact);

        License license = new License();
        license.name("MIT License");
        license.url("https://opensource.org/licenses/MIT");
        info.license(license);

        openAPI.info(info);

        Server server = new Server();
        server.url("{scheme}://{host}");
        server.description("API Server");
        server.variables(createServerVariables());

        openAPI.servers(List.of(server));

        Tag[] tags = new Tag[] {
                new Tag().name("Authentication").description("Operations related to user authentication and registration"),
                new Tag().name("Forums").description("Operations for managing forums and categories"),
                new Tag().name("Threads").description("Operations for managing discussion threads"),
                new Tag().name("Posts").description("Operations for managing posts within threads"),
                new Tag().name("Comments").description("Operations for managing comments on posts"),
                new Tag().name("Users").description("Operations for user management"),
                new Tag().name("Reports").description("Operations for content reporting and moderation"),
                new Tag().name("Admin Dashboard").description("Administrative operations for system monitoring and management")
        };

        openAPI.tags(Arrays.asList(tags));

        Components components = new Components();
        SecurityScheme securityScheme = new SecurityScheme();
        securityScheme.type(SecurityScheme.Type.HTTP);
        securityScheme.scheme("bearer");
        securityScheme.bearerFormat("JWT");
        securityScheme.description("JWT token authentication. Enter your token in the format: Bearer <token>");
        components.addSecuritySchemes("bearerAuth", securityScheme);
        openAPI.components(components);

        SecurityRequirement securityRequirement = new SecurityRequirement();
        securityRequirement.addList("bearerAuth");
        openAPI.addSecurityItem(securityRequirement);

        return openAPI;
    }

    private ServerVariables createServerVariables() {
        ServerVariables serverVariables = new ServerVariables();
        ServerVariable scheme = new ServerVariable();
        scheme.setDefault("https");
        scheme.enum_(Arrays.asList("http", "https"));
        scheme.description("URI scheme");
        serverVariables.addServerVariable("scheme", scheme);

        ServerVariable host = new ServerVariable();
        host.setDefault("it342-cit-uforums.onrender.com");
        host.enum_(Arrays.asList(
                "it342-cit-uforums.onrender.com", 
                "localhost:8080", 
                "localhost:8000"));
        host.description("Host name");
        serverVariables.addServerVariable("host", host);

        return serverVariables;
    }
}