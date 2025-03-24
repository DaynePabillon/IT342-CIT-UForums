package edu.cit.citforums.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class ViewController {
    private static final Logger logger = LoggerFactory.getLogger(ViewController.class);

    @GetMapping("/login")
    public String login(Model model) {
        logger.info("Login page requested");
        try {
            // Add empty attributes to ensure model is populated
            model.addAttribute("loginFormUrl", "/login");
            logger.info("Returning login view");
            return "login";
        } catch (Exception e) {
            logger.error("Error rendering login view: {}", e.getMessage(), e);
            return "redirect:/error";
        }
    }

    @GetMapping("/register")
    public String register(Model model) {
        logger.info("Register page requested");
        try {
            model.addAttribute("registerFormUrl", "/auth/register");
            logger.info("Returning register view");
            return "register";
        } catch (Exception e) {
            logger.error("Error rendering register view: {}", e.getMessage(), e);
            return "redirect:/error";
        }
    }

    @GetMapping("/home")
    public String home(Model model) {
        logger.info("Home page requested");
        try {
            model.addAttribute("welcomeMessage", "Welcome to CIT Forums!");
            logger.info("Returning home view with welcomeMessage attribute");
            return "home";
        } catch (Exception e) {
            logger.error("Error rendering home view: {}", e.getMessage(), e);
            return "redirect:/error";
        }
    }
    
    @GetMapping("/")
    public String root() {
        logger.info("Root URL accessed, redirecting to index.html");
        return "redirect:/index.html";
    }
    
    @GetMapping("/test-thymeleaf")
    public String testThymeleaf(Model model) {
        logger.info("Thymeleaf test page requested");
        try {
            model.addAttribute("testMessage", "This is a test message from the controller!");
            logger.info("Returning test view with testMessage attribute");
            return "test";
        } catch (Exception e) {
            logger.error("Error rendering test view: {}", e.getMessage(), e);
            return "redirect:/error";
        }
    }
    
    @ExceptionHandler(Exception.class)
    public ModelAndView handleException(Exception ex) {
        logger.error("Uncaught exception in ViewController: {}", ex.getMessage(), ex);
        ModelAndView mav = new ModelAndView("error");
        mav.addObject("errorCode", "500");
        mav.addObject("errorMessage", "An error occurred in the view controller: " + ex.getMessage());
        return mav;
    }
} 