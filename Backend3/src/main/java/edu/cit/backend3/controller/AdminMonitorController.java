package edu.cit.backend3.controller;

import edu.cit.backend3.dto.response.MemoryUsageResponse;
import edu.cit.backend3.dto.response.SystemStatusResponse;
import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.ForumRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.ThreadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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
import java.lang.management.MemoryUsage;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/monitor")
@Tag(name = "System Monitor", description = "System health and performance monitoring")
public class AdminMonitorController {

    private final ForumRepository forumRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final Instant startTime = Instant.now();

    @Autowired
    public AdminMonitorController(
            ForumRepository forumRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository,
            MemberRepository memberRepository) {
        this.forumRepository = forumRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.memberRepository = memberRepository;
    }

    @GetMapping("/health")
    @Operation(
        summary = "Check if the system is up and running",
        description = "Simple health check endpoint that returns the current system status and timestamp"
    )
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get detailed system statistics",
        description = "Provides comprehensive statistics about the system including user counts, content counts, and server metrics",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "200", description = "System statistics", 
        content = @Content(schema = @Schema(implementation = SystemStatusResponse.class)))
    @ApiResponse(responseCode = "401", description = "Unauthorized - Authentication required")
    @ApiResponse(responseCode = "403", description = "Forbidden - Insufficient permissions")
    public ResponseEntity<SystemStatusResponse> getSystemStats() {
        SystemStatusResponse stats = new SystemStatusResponse();
        
        // Basic status
        stats.setStatus("UP");
        stats.setServerTime(LocalDateTime.now().toString());
        
        // Start time and uptime calculation
        LocalDateTime start = LocalDateTime.ofInstant(startTime, ZoneId.systemDefault());
        stats.setStartTime(start.toString());
        
        Duration uptime = Duration.between(startTime, Instant.now());
        long days = uptime.toDays();
        long hours = uptime.toHoursPart();
        long minutes = uptime.toMinutesPart();
        stats.setUptime(String.format("%d days, %d hours, %d minutes", days, hours, minutes));
        
        // Database counts
        stats.setForumCount(forumRepository.count());
        stats.setThreadCount(threadRepository.count());
        stats.setCommentCount(commentRepository.count());
        stats.setUserCount(memberRepository.count());
        
        // System metrics
        Map<String, Object> systemMetrics = new HashMap<>();
        
        // JVM memory metrics
        Runtime runtime = Runtime.getRuntime();
        systemMetrics.put("totalMemory", runtime.totalMemory());
        systemMetrics.put("freeMemory", runtime.freeMemory());
        systemMetrics.put("maxMemory", runtime.maxMemory());
        systemMetrics.put("availableProcessors", runtime.availableProcessors());
        
        // JVM metrics
        systemMetrics.put("javaVersion", System.getProperty("java.version"));
        systemMetrics.put("javaVendor", System.getProperty("java.vendor"));
        systemMetrics.put("osName", System.getProperty("os.name"));
        systemMetrics.put("osVersion", System.getProperty("os.version"));
        
        stats.setSystemMetrics(systemMetrics);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/memory")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get memory usage",
        description = "Returns detailed information about memory usage",
        security = @SecurityRequirement(name = "bearerAuth"),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Memory usage statistics retrieved successfully"
            ),
            @ApiResponse(
                responseCode = "403",
                description = "Forbidden - requires admin privileges"
            )
        }
    )
    public ResponseEntity<MemoryUsageResponse> getMemoryUsage() {
        MemoryUsageResponse response = new MemoryUsageResponse();
        
        // Get the memory MX bean
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        // Get heap memory usage statistics
        MemoryUsage heapMemoryUsage = memoryBean.getHeapMemoryUsage();
        Map<String, Object> heapMemory = new HashMap<>();
        heapMemory.put("init", heapMemoryUsage.getInit() / (1024 * 1024));
        heapMemory.put("used", heapMemoryUsage.getUsed() / (1024 * 1024));
        heapMemory.put("committed", heapMemoryUsage.getCommitted() / (1024 * 1024));
        heapMemory.put("max", heapMemoryUsage.getMax() / (1024 * 1024));
        
        // Get non-heap memory usage statistics
        MemoryUsage nonHeapMemoryUsage = memoryBean.getNonHeapMemoryUsage();
        Map<String, Object> nonHeapMemory = new HashMap<>();
        nonHeapMemory.put("init", nonHeapMemoryUsage.getInit() / (1024 * 1024));
        nonHeapMemory.put("used", nonHeapMemoryUsage.getUsed() / (1024 * 1024));
        nonHeapMemory.put("committed", nonHeapMemoryUsage.getCommitted() / (1024 * 1024));
        nonHeapMemory.put("max", nonHeapMemoryUsage.getMax() / (1024 * 1024));
        
        // Set the response values
        response.setHeapMemoryUsage(heapMemory);
        response.setNonHeapMemoryUsage(nonHeapMemory);
        response.setTotalMemory(Runtime.getRuntime().totalMemory() / (1024 * 1024));
        response.setFreeMemory(Runtime.getRuntime().freeMemory() / (1024 * 1024));
        
        return ResponseEntity.ok(response);
    }
} 