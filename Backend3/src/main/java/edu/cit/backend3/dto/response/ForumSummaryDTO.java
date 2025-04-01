package edu.cit.backend3.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Summary of forum information for administrative purposes")
public class ForumSummaryDTO {
    
    @Schema(description = "Forum ID", example = "1")
    private Long id;
    
    @Schema(description = "Forum title", example = "General Discussion")
    private String title;
    
    @Schema(description = "Forum description", example = "A place to discuss general topics related to CIT")
    private String description;
    
    @Schema(description = "Number of threads in the forum", example = "24")
    private int threadCount;
    
    @Schema(description = "Number of comments across all threads in the forum", example = "128")
    private int commentCount;
    
    @Schema(description = "Forum creation date", example = "2023-01-01T09:00:00.000Z")
    private String createdAt;
    
    @Schema(description = "Last activity date in the forum", example = "2023-05-15T14:30:22.456Z")
    private String lastActivity;
} 