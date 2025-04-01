package edu.cit.backend3.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "System status information for monitoring")
public class SystemStatusResponse {

    @Schema(description = "Overall system status (UP, DOWN, etc)", example = "UP")
    private String status;
    
    @Schema(description = "Current server time", example = "2025-03-21T15:30:45")
    private String serverTime;
    
    @Schema(description = "Application start time", example = "2025-03-20T08:15:30")
    private String startTime;
    
    @Schema(description = "System uptime", example = "1 days, 7 hours, 15 minutes")
    private String uptime;
    
    @Schema(description = "Total number of forums", example = "25")
    private long forumCount;
    
    @Schema(description = "Total number of threads", example = "342")
    private long threadCount;
    
    @Schema(description = "Total number of comments", example = "1892")
    private long commentCount;
    
    @Schema(description = "Total number of registered users", example = "156")
    private long userCount;
    
    @Schema(description = "Detailed system metrics")
    private Map<String, Object> systemMetrics;
} 