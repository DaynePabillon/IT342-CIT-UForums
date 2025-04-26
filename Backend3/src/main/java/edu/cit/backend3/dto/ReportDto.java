package edu.cit.backend3.dto;

import edu.cit.backend3.models.Report;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    
    // Support both field names for content type
    @JsonProperty(value = "contentType", access = JsonProperty.Access.READ_WRITE)
    private String contentType;
    
    @JsonProperty(value = "reportedContentType", access = JsonProperty.Access.WRITE_ONLY)
    public void setReportedContentType(String reportedContentType) {
        this.contentType = reportedContentType;
    }
    
    // Support both field names for content id
    @JsonProperty(value = "contentId", access = JsonProperty.Access.READ_WRITE)
    private Long contentId;
    
    @JsonProperty(value = "reportedContentId", access = JsonProperty.Access.WRITE_ONLY)
    public void setReportedContentId(Long reportedContentId) {
        this.contentId = reportedContentId;
    }
    
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
