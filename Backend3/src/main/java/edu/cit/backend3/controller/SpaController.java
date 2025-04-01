package edu.cit.backend3.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller that forwards any non-API requests to the React app index.html
 * This allows React Router to handle client-side routing
 */
@Controller
public class SpaController {

    /**
     * Maps all non-API, non-static resource requests to index.html
     * The React router will then handle the actual routing on the client side
     */
    @RequestMapping({
        "/",
        "/login",
        "/register",
        "/profile",
        "/forums",
        "/forums/**",
        "/threads/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
} 