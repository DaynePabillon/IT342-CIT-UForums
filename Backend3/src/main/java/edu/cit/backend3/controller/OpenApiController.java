package edu.cit.backend3.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * Controller for serving OpenAPI specifications
 */
@Controller
@RequestMapping("/openapi")
public class OpenApiController {

    /**
     * Serves the static OpenAPI YAML file
     * @return OpenAPI specification as YAML
     * @throws IOException if file cannot be read
     */
    @GetMapping(value = "/openapi.yaml", produces = "application/yaml")
    @ResponseBody
    public byte[] getOpenApiYaml() throws IOException {
        Resource resource = new ClassPathResource("openapi/openapi.yaml");
        return Files.readAllBytes(resource.getFile().toPath());
    }
    
    /**
     * Serves the OpenAPI JSON file for the standalone Swagger UI
     * @return OpenAPI specification as JSON
     * @throws IOException if file cannot be read
     */
    @GetMapping(value = "/openapi.json", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public byte[] getOpenApiJson() throws IOException {
        // Using the springdoc generated JSON file
        Resource resource = new ClassPathResource("static/v3/api-docs/swagger-config.json");
        if (!resource.exists()) {
            // Fallback to the standard api-docs endpoint output
            resource = new ClassPathResource("static/v3/api-docs.json");
        }
        return Files.readAllBytes(resource.getFile().toPath());
    }
}