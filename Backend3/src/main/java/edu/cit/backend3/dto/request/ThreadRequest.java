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
public class ThreadRequest {
    
    @NotBlank(message = "Thread title cannot be empty")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    @NotBlank(message = "Thread content cannot be empty")
    @Size(min = 10, max = 2000, message = "Content must be between 10 and 2000 characters")
    private String content;
    
    @NotNull(message = "Forum ID cannot be null")
    private Long forumId;
    
    private boolean pinned = false;
    
    private boolean locked = false;
} 