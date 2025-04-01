package edu.cit.backend3.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User activity metrics over a time period")
public class UserActivityDTO {
    
    @Schema(description = "Start date of the period (YYYY-MM-DD)", example = "2023-01-01")
    private String startDate;
    
    @Schema(description = "End date of the period (YYYY-MM-DD)", example = "2023-01-31")
    private String endDate;
    
    @Schema(description = "Grouping interval (day, week, month)", example = "day")
    private String groupBy;
    
    @Schema(description = "New user registrations by period", 
           example = "{\"2023-01-01\": 5, \"2023-01-02\": 3, \"2023-01-03\": 7}")
    private Map<String, Integer> newUserRegistrations;
    
    @Schema(description = "Thread creations by period", 
           example = "{\"2023-01-01\": 12, \"2023-01-02\": 8, \"2023-01-03\": 15}")
    private Map<String, Integer> threadCreations;
    
    @Schema(description = "Comment creations by period", 
           example = "{\"2023-01-01\": 45, \"2023-01-02\": 32, \"2023-01-03\": 67}")
    private Map<String, Integer> commentCreations;
    
    @Schema(description = "Active users by period (users who posted or commented)", 
           example = "{\"2023-01-01\": 18, \"2023-01-02\": 14, \"2023-01-03\": 22}")
    private Map<String, Integer> activeUsers;
} 