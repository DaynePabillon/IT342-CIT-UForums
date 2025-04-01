package edu.cit.backend3.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    
    @NotBlank(message = "Username or email cannot be empty")
    private String usernameOrEmail;
    
    @NotBlank(message = "Password cannot be empty")
    private String password;
} 