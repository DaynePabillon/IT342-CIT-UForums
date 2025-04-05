package edu.cit.backend3.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumRequest {
    
    @NotBlank(message = "Forum title cannot be empty")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    private boolean active = true;

    @NotBlank(message = "Category is required")
    private String categoryName;
} 