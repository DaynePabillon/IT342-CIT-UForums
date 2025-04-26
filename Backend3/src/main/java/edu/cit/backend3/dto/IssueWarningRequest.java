package edu.cit.backend3.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueWarningRequest {
    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private String contentType; // Optional, if warning is related to specific content
    
    private Long contentId; // Optional, if warning is related to specific content
}
