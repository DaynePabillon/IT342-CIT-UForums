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
public class CreateWarningRequest {
    @NotNull(message = "Member ID is required")
    private Long memberId;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    @NotBlank(message = "Message is required")
    private String message;
}
