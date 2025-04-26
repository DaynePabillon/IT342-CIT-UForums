package edu.cit.backend3.dto;

import edu.cit.backend3.models.Warning;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarningDto {
    private Long id;
    private Long memberId;
    private String memberUsername;
    private Long warnedById;
    private String warnedByUsername;
    private String reason;
    private String message;
    private LocalDateTime createdAt;
    
    public static WarningDto fromEntity(Warning warning) {
        return WarningDto.builder()
                .id(warning.getId())
                .memberId(warning.getMember().getId())
                .memberUsername(warning.getMember().getName())
                .warnedById(warning.getWarnedBy().getId())
                .warnedByUsername(warning.getWarnedBy().getName())
                .reason(warning.getReason())
                .message(warning.getMessage())
                .createdAt(warning.getCreatedAt())
                .build();
    }
}
