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
    private Long adminId;
    private String adminUsername;
    private String reason;
    private String contentType;
    private Long contentId;
    private LocalDateTime createdAt;
    private boolean acknowledged;
    private LocalDateTime acknowledgedAt;
    
    public static WarningDto fromEntity(Warning warning) {
        WarningDto dto = new WarningDto();
        dto.setId(warning.getId());
        
        if (warning.getMember() != null) {
            dto.setMemberId(warning.getMember().getId());
            dto.setMemberUsername(warning.getMember().getName());
        }
        
        if (warning.getAdmin() != null) {
            dto.setAdminId(warning.getAdmin().getId());
            dto.setAdminUsername(warning.getAdmin().getName());
        }
        
        dto.setReason(warning.getReason());
        dto.setContentType(warning.getContentType());
        dto.setContentId(warning.getContentId());
        dto.setCreatedAt(warning.getCreatedAt());
        dto.setAcknowledged(warning.isAcknowledged());
        dto.setAcknowledgedAt(warning.getAcknowledgedAt());
        
        return dto;
    }
}
