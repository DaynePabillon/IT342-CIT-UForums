package edu.cit.backend3.dto.request;

import jakarta.validation.constraints.Email;
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
public class ProfileUpdateRequest {
    
    // Remove @NotBlank to allow partial updates
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, underscores, and hyphens (no spaces)")
    private String name;
    
    // Remove @NotBlank to allow partial updates
    @Email(message = "Invalid email format")
    private String email;
    
    private String firstName;
    
    private String lastName;
    
    @Pattern(regexp = "^\\d{11}$", message = "Phone number must be 11 digits without dashes or spaces")
    private String phoneNumber;
    
    @Pattern(regexp = "^(\\d{2}-\\d{4}-\\d{3})?$", message = "Student ID must be in format ##-####-### or can be empty")
    private String studentNumber;
    
    private String city;
    
    private String province;
    
    private String address;
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    @Override
    public String toString() {
        return "ProfileUpdateRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", studentNumber='" + studentNumber + '\'' +
                ", city='" + city + '\'' +
                ", province='" + province + '\'' +
                ", address='" + address + '\'' +
                ", bio='" + bio + '\'' +
                '}';
    }
}