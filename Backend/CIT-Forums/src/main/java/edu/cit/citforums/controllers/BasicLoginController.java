package edu.cit.citforums.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BasicLoginController {

    @GetMapping("/basic-login")
    public String basicLogin() {
        return "redirect:/basic-login.html";
    }
} 