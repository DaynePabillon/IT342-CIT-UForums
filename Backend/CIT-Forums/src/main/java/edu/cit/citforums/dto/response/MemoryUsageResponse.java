package edu.cit.citforums.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Memory usage statistics for the application")
public class MemoryUsageResponse {

    @Schema(description = "Heap memory usage information", example = "{\"init\": 268435456, \"used\": 128974600, \"committed\": 267886592, \"max\": 3817865216, \"usagePercentage\": 3.38}")
    private Map<String, Object> heapMemoryUsage;
    
    @Schema(description = "Non-heap memory usage information", example = "{\"init\": 7667712, \"used\": 75547200, \"committed\": 78643200, \"max\": -1}")
    private Map<String, Object> nonHeapMemoryUsage;
    
    @Schema(description = "Total memory available to JVM in bytes", example = "267886592")
    private long totalMemory;
    
    @Schema(description = "Free memory available to JVM in bytes", example = "138911992")
    private long freeMemory;
} 