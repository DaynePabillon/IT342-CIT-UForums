package edu.cit.backend3.dto;

import edu.cit.backend3.models.Report;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
    private Long id;
    private Long reporterId;
    private String reporterUsername;
    private String reason;
    private String contentType;
    private Long contentId;
    private String status;
    private Long resolverId;
    private String resolverUsername;
    private String action;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    
    public static ReportDto fromEntity(Report report) {
        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        
        if (report.getReporter() != null) {
            dto.setReporterId(report.getReporter().getId());
            dto.setReporterUsername(report.getReporter().getName());
        }
        
        dto.setReason(report.getReason());
        dto.setContentType(report.getContentType());
        dto.setContentId(report.getContentId());
        dto.setStatus(report.getStatus());
        
        if (report.getResolver() != null) {
            dto.setResolverId(report.getResolver().getId());
            dto.setResolverUsername(report.getResolver().getName());
        }
        
        dto.setAction(report.getAction());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setResolvedAt(report.getResolvedAt());
        
        return dto;
    }
}
