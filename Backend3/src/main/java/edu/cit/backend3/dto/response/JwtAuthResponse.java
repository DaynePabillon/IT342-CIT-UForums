package edu.cit.backend3.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtAuthResponse {
    private String token;
    private String tokenType = "Bearer";
    
    public JwtAuthResponse(String token) {
        this.token = token;
    }
} 