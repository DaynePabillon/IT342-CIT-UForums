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
public class CommentRequest {
    
    @NotBlank(message = "Comment content cannot be empty")
    @Size(min = 1, max = 1000, message = "Content must be between 1 and 1000 characters")
    private String content;
    
    @NotNull(message = "Post ID cannot be null")
    private Long postId;
} 