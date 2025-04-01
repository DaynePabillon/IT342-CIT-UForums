package edu.cit.citforums.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.sql.SQLException;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(Exception.class)
    public String handleException(Exception e, Model model) {
        logger.error("Global exception caught: {}", e.getMessage(), e);
        
        String errorMessage = e.getMessage() != null ? e.getMessage() : "An unexpected error occurred";
        // For security reasons, don't expose SQL errors to end users
        if (e instanceof SQLException || e.getCause() instanceof SQLException) {
            logger.error("SQL Exception details: {}", e.getMessage());
            errorMessage = "A database error occurred. Please try again later.";
        }
        
        model.addAttribute("errorCode", "500");
        model.addAttribute("errorMessage", errorMessage);
        
        return "error";
    }
} 