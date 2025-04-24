package edu.cit.backend3.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberRegistrationRequest {
    
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, underscores, and hyphens")
    private String name;
    
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    private String firstName;
    
    private String lastName;
    
    @Pattern(regexp = "^\\d{3}-\\d{3}-\\d{4}$", message = "Phone number must be in format ###-###-####")
    private String phoneNumber;
    
    private String city;
    
    private String province;
    
    private String address;
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;
}