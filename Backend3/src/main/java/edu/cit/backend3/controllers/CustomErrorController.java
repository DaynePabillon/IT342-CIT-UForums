package edu.cit.backend3.controllers;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomErrorController.class);
    
    private static final String ERROR_PATH = "/error";
    
    @RequestMapping(ERROR_PATH)
    public String handleError(HttpServletRequest request, Model model) {
        // Get error details
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        
        // Log the error details
        logger.error("Error occurred! Status: {}, Message: {}", status, message);
        if (exception != null) {
            logger.error("Exception details: ", (Throwable) exception);
        }
        
        // Default error information
        String errorMessage = "An unexpected error occurred";
        String statusCode = "Unknown";
        
        if (status != null) {
            statusCode = status.toString();
            // Get specific error message based on status code
            if (status.toString().equals("404")) {
                errorMessage = "Page not found";
            } else if (status.toString().equals("500")) {
                errorMessage = "Internal server error";
            } else if (status.toString().equals("403")) {
                errorMessage = "Access denied";
            }
        }
        
        // Use the provided error message if available
        if (message != null && !message.toString().isEmpty() && !message.toString().equals("null")) {
            errorMessage = message.toString();
        } else if (exception != null && exception instanceof Throwable) {
            Throwable throwable = (Throwable) exception;
            if (throwable.getMessage() != null && !throwable.getMessage().isEmpty()) {
                errorMessage = throwable.getMessage();
            }
        }
        
        model.addAttribute("errorCode", statusCode);
        model.addAttribute("errorMessage", errorMessage);
        
        return "error";
    }
    
    public String getErrorPath() {
        return ERROR_PATH;
    }
} 