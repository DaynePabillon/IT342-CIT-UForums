package edu.cit.citforums.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/db-test")
public class DatabaseTestController {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseTestController.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @GetMapping
    @ResponseBody
    public String testConnection() {
        try {
            // Simple query to test if DB is accessible
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return "Database connection successful! Result: " + result;
        } catch (Exception e) {
            logger.error("Database connection test failed: {}", e.getMessage(), e);
            return "Database connection failed: " + e.getMessage();
        }
    }
} 