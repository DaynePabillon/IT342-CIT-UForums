package edu.cit.citforums.dto.request;

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
public class PostRequest {
    
    @NotBlank(message = "Post content cannot be empty")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    private String content;
    
    @NotNull(message = "Thread ID cannot be null")
    private Long threadId;
} 