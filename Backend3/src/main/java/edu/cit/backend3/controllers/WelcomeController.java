package edu.cit.backend3.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to CIT Forums! This is a plain text response that bypasses Thymeleaf.";
    }
    
    @GetMapping("/api/status")
    public String status() {
        return "Application is running. Status: OK";
    }
} 