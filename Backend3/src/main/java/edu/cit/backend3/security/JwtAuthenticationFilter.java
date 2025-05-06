package edu.cit.backend3.security;

import edu.cit.backend3.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    // List of path prefixes that should skip authentication
    private static final List<String> SWAGGER_PATHS = Arrays.asList(
        "/swagger", "/swagger-ui", "/v3/api-docs", "/swagger-resources", "/webjars"
    );
    
    // List of public paths that should skip authentication
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/error", "/login", "/register", "/api/auth/", "/api/forums/"
    );

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;
    
    // Cast the UserDetailsService to our custom implementation
    private CustomUserDetailsService getCustomUserDetailsService() {
        return (CustomUserDetailsService) userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Skip authentication for Swagger UI and public paths
        String requestPath = request.getRequestURI();
        
        if (shouldSkipAuthentication(request, requestPath)) {
            logger.debug("Skipping JWT authentication for path: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String userId = tokenProvider.getUserIdFromToken(jwt);
                logger.debug("Extracted user ID from token: {}", userId);
                
                // Clear any existing authentication
                SecurityContextHolder.clearContext();
                
                // Try to parse the userId as a Long
                try {
                    Long id = Long.parseLong(userId);
                    logger.debug("Loading user by ID: {}", id);
                    UserDetails userDetails = getCustomUserDetailsService().loadUserById(id);
                    logger.debug("Loaded user: {}", userDetails.getUsername());
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("Set authentication for user: {}", userDetails.getUsername());
                } catch (NumberFormatException e) {
                    // If userId is not a valid Long, fall back to the old method
                    logger.warn(String.format("Token contains invalid user ID: %s", userId));
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } catch (Exception ex) {
                        logger.error("Failed to load user by username", ex);
                    }
                }
            } else if (StringUtils.hasText(jwt)) {
                logger.debug("Invalid JWT token: {}", jwt);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean shouldSkipAuthentication(HttpServletRequest request, String requestPath) {
        // Skip authentication for static resources
        if (requestPath.endsWith(".js") || requestPath.endsWith(".css") || 
            requestPath.endsWith(".html") || requestPath.endsWith(".json") || 
            requestPath.endsWith(".ico") || requestPath.startsWith("/static/") || 
            requestPath.startsWith("/assets/")) {
            return true;
        }
        
        // Skip authentication for Swagger UI paths
        for (String swaggerPath : SWAGGER_PATHS) {
            if (requestPath.contains(swaggerPath)) {
                return true;
            }
        }
        
        // Skip authentication for public paths
        for (String publicPath : PUBLIC_PATHS) {
            if (requestPath.contains(publicPath)) {
                return true;
            }
        }
        
        // Skip authentication for GET requests to public API endpoints
        if (request.getMethod().equals("GET") && (
            requestPath.startsWith("/api/threads/") || 
            requestPath.startsWith("/api/posts/") || 
            requestPath.startsWith("/api/comments/"))) {
            return true;
        }
        
        return false;
    }
}