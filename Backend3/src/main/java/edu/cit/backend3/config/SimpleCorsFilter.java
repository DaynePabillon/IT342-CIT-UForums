package edu.cit.backend3.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SimpleCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        // Get the request URI
        String requestURI = request.getRequestURI();
        String origin = request.getHeader("Origin");
        
        // For Swagger UI and API docs, allow any origin
        if (origin != null && (requestURI.contains("/swagger-ui") || 
                              requestURI.contains("/v3/api-docs") || 
                              requestURI.contains("/swagger-resources") || 
                              requestURI.contains("/webjars/") || 
                              requestURI.contains("/openapi"))) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        // For other endpoints, allow specific origins
        else if (origin != null && (origin.equals("https://it342-cit-uforums-site.onrender.com") || 
                              origin.equals("http://localhost:3000") ||
                              origin.equals("http://localhost:8000") ||
                              origin.equals("http://127.0.0.1:8000") ||
                              origin.equals("http://127.0.0.1:3000"))) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
        
        // Allow credentials
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me, Authorization");

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
