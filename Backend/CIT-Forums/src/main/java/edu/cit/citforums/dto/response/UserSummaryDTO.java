package edu.cit.citforums.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Summary of user information for administrative purposes")
public class UserSummaryDTO {
    
    @Schema(description = "User ID", example = "1")
    private Long id;
    
    @Schema(description = "Username", example = "johndoe")
    private String username;
    
    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "Full name", example = "John Doe")
    private String fullName;
    
    @Schema(description = "User roles", example = "[\"USER\", \"ADMIN\"]")
    private List<String> roles;
    
    @Schema(description = "Whether the user account is active", example = "true")
    private boolean active;
    
    @Schema(description = "Account creation date", example = "2023-01-15T10:30:45.123Z")
    private String createdAt;
    
    @Schema(description = "Last login date", example = "2023-05-20T14:22:11.456Z")
    private String lastLogin;
    
    @Schema(description = "Number of threads created by the user", example = "15")
    private int threadCount;
    
    @Schema(description = "Number of comments posted by the user", example = "42")
    private int commentCount;
} 