package edu.cit.backend3.controller;

import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.ForumRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.ThreadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@Tag(name = "Legacy System Monitoring", description = "Legacy endpoints for system monitoring and health checks")
public class SystemMonitorController {

    private final ForumRepository forumRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;

    @Autowired
    public SystemMonitorController(
            ForumRepository forumRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository,
            MemberRepository memberRepository) {
        this.forumRepository = forumRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.memberRepository = memberRepository;
    }

    @GetMapping("/legacy-health")
    @Operation(
            summary = "Legacy System Health",
            description = "Legacy endpoint for health information about the system"
    )
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/legacy-stats")
    @Operation(
            summary = "Legacy System Statistics",
            description = "Legacy endpoint for detailed statistics about the system usage",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved system statistics",
                    content = @Content(mediaType = "application/json")
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Access denied",
                    content = @Content
            )
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Database statistics
        Map<String, Object> dbStats = new HashMap<>();
        dbStats.put("forums", forumRepository.count());
        dbStats.put("threads", threadRepository.count());
        dbStats.put("comments", commentRepository.count());
        dbStats.put("users", memberRepository.count());
        stats.put("database", dbStats);
        
        // JVM statistics
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        
        Map<String, Object> jvmStats = new HashMap<>();
        jvmStats.put("heapMemoryUsage", formatBytes(memoryBean.getHeapMemoryUsage().getUsed()));
        jvmStats.put("heapMemoryMax", formatBytes(memoryBean.getHeapMemoryUsage().getMax()));
        jvmStats.put("nonHeapMemoryUsage", formatBytes(memoryBean.getNonHeapMemoryUsage().getUsed()));
        jvmStats.put("processors", osBean.getAvailableProcessors());
        jvmStats.put("systemLoadAverage", osBean.getSystemLoadAverage());
        jvmStats.put("jvmStartTime", formatTimestamp(runtimeBean.getStartTime()));
        jvmStats.put("jvmUptime", formatDuration(runtimeBean.getUptime()));
        stats.put("system", jvmStats);
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/legacy-memory")
    @Operation(
            summary = "Legacy Memory Usage",
            description = "Legacy endpoint for detailed memory usage information",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getMemoryUsage() {
        Map<String, Object> memoryStats = new HashMap<>();
        
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        Map<String, Object> heap = new HashMap<>();
        heap.put("used", formatBytes(memoryBean.getHeapMemoryUsage().getUsed()));
        heap.put("committed", formatBytes(memoryBean.getHeapMemoryUsage().getCommitted()));
        heap.put("max", formatBytes(memoryBean.getHeapMemoryUsage().getMax()));
        heap.put("init", formatBytes(memoryBean.getHeapMemoryUsage().getInit()));
        heap.put("percentUsed", Math.round((double) memoryBean.getHeapMemoryUsage().getUsed() / memoryBean.getHeapMemoryUsage().getMax() * 100) + "%");
        
        Map<String, Object> nonHeap = new HashMap<>();
        nonHeap.put("used", formatBytes(memoryBean.getNonHeapMemoryUsage().getUsed()));
        nonHeap.put("committed", formatBytes(memoryBean.getNonHeapMemoryUsage().getCommitted()));
        
        memoryStats.put("heap", heap);
        memoryStats.put("nonHeap", nonHeap);
        
        return ResponseEntity.ok(memoryStats);
    }
    
    // Helper methods
    private String formatBytes(long bytes) {
        // Convert bytes to MB
        return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
    }
    
    private String formatTimestamp(long timestamp) {
        LocalDateTime dateTime = Instant.ofEpochMilli(timestamp)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        return dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
    
    private String formatDuration(long millis) {
        Duration duration = Duration.ofMillis(millis);
        long days = duration.toDays();
        duration = duration.minusDays(days);
        long hours = duration.toHours();
        duration = duration.minusHours(hours);
        long minutes = duration.toMinutes();
        
        return String.format("%d days, %d hours, %d minutes", days, hours, minutes);
    }
} 