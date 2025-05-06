package edu.cit.backend3.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SimpleCorsFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(SimpleCorsFilter.class);

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String requestURI = request.getRequestURI();
        String origin = request.getHeader("Origin");
        
        // Set standard CORS headers for all responses
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, remember-me, Authorization");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // For Swagger UI, API docs, and error paths, allow any origin
        if (isSwaggerOrPublicPath(requestURI)) {
            logger.debug("Allowing any origin for Swagger/public path: {}", requestURI);
            response.setHeader("Access-Control-Allow-Origin", "*");
        } else if (origin != null) {
            // For other endpoints, allow specific origins
            if (isAllowedOrigin(origin)) {
                logger.debug("Allowing specific origin for path {}: {}", requestURI, origin);
                response.setHeader("Access-Control-Allow-Origin", origin);
            }
        }
        
        // Handle preflight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }
    
    private boolean isSwaggerOrPublicPath(String path) {
        return path.contains("/swagger") || 
               path.contains("/v3/api-docs") || 
               path.contains("/swagger-ui") || 
               path.contains("/swagger-resources") || 
               path.contains("/webjars") ||
               path.contains("/error") ||
               path.equals("/") ||
               path.equals("/login") ||
               path.equals("/register") ||
               path.endsWith(".js") ||
               path.endsWith(".css") ||
               path.endsWith(".html") ||
               path.endsWith(".json") ||
               path.endsWith(".ico") ||
               path.startsWith("/static/") ||
               path.startsWith("/assets/");
    }
    
    private boolean isAllowedOrigin(String origin) {
        return origin.equals("https://it342-cit-uforums-site.onrender.com") || 
               origin.equals("http://localhost:3000") ||
               origin.equals("http://localhost:8000") ||
               origin.equals("http://127.0.0.1:8000") ||
               origin.equals("http://127.0.0.1:3000");
    }

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
