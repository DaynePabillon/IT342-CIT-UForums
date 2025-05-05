package edu.cit.backend3.controllers;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.Map;

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
    
    // Add a JSON error handler for REST API calls
    @RequestMapping(value = ERROR_PATH, produces = "application/json")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleErrorJson(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        
        // Get error details
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        
        // Default error information
        String errorMessage = "An unexpected error occurred";
        int statusCode = 500;
        
        if (status != null) {
            try {
                statusCode = Integer.parseInt(status.toString());
                // Get specific error message based on status code
                if (statusCode == 404) {
                    errorMessage = "Resource not found";
                } else if (statusCode == 403) {
                    errorMessage = "Access denied";
                }
            } catch (NumberFormatException e) {
                logger.warn("Could not parse status code: {}", status);
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
        
        errorDetails.put("status", statusCode);
        errorDetails.put("message", errorMessage);
        errorDetails.put("path", request.getRequestURI());
        
        return new ResponseEntity<>(errorDetails, HttpStatus.valueOf(statusCode));
    }
    
    public String getErrorPath() {
        return ERROR_PATH;
    }
}