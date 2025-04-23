package edu.cit.backend3.security;

import edu.cit.backend3.models.Member;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long expiration;
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Autowired
    public JwtTokenProvider(JwtConfig jwtConfig) {
        this.secretKey = jwtConfig.secretKey();
        this.expiration = jwtConfig.getExpiration();
    }

    public String generateToken(Authentication authentication) {
        User principal = (User) authentication.getPrincipal();
        String userId = principal.getUsername(); // This is now the user ID from CustomUserDetailsService
        
        logger.info("Generating token for user ID: {}", userId);
        return createToken(userId);
    }

    public String generateTokenFromMember(Member member) {
        String identifier = String.valueOf(member.getId()); // Use ID instead of name
        logger.info("Generating token from member: id={}, name={}, email={}", 
                   member.getId(), member.getName(), member.getEmail());
        return createToken(identifier);
    }

    private String createToken(String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        Map<String, Object> claims = new HashMap<>();
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    // Renamed for clarity, but still returns the same value (now a user ID)
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
} 