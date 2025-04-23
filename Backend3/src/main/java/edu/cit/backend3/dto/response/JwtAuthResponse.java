package edu.cit.backend3.dto.response;

import edu.cit.backend3.dto.MemberDto;
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
    private MemberDto user;
    
    public JwtAuthResponse(String token) {
        this.token = token;
    }
    
    public JwtAuthResponse(String token, MemberDto user) {
        this.token = token;
        this.user = user;
    }
}