package edu.cit.backend3.controller;

import edu.cit.backend3.dto.response.ApiResponse;
import edu.cit.backend3.dto.response.SystemStatusResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Dashboard", description = "Admin dashboard statistics endpoints")
public class AdminDashboardController {

    private final ForumRepository forumRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final LocalDateTime applicationStartTime = LocalDateTime.now();

    @Autowired
    public AdminDashboardController(
            ForumRepository forumRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository,
            MemberRepository memberRepository) {
        this.forumRepository = forumRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.memberRepository = memberRepository;
    }

    @GetMapping("/status")
    @Operation(
            summary = "Get system status",
            description = "Returns the current status of the CIT Forums system including uptime and counts",
            security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved system status",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = SystemStatusResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Access denied",
                    content = @Content)
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemStatusResponse> getSystemStatus() {
        // System uptime
        LocalDateTime now = LocalDateTime.now();
        long uptimeHours = java.time.Duration.between(applicationStartTime, now).toHours();
        
        // Formatter for dates
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        // Counts
        long forumCount = forumRepository.count();
        long threadCount = threadRepository.count();
        long commentCount = commentRepository.count();
        long userCount = memberRepository.count();
        
        // Build response
        SystemStatusResponse response = new SystemStatusResponse();
        response.setStatus("UP");
        response.setServerTime(now.format(formatter));
        response.setStartTime(applicationStartTime.format(formatter));
        response.setUptime(uptimeHours + " hours");
        response.setForumCount(forumCount);
        response.setThreadCount(threadCount);
        response.setCommentCount(commentCount);
        response.setUserCount(userCount);
        
        // Add additional system metrics if needed
        Map<String, Object> systemMetrics = new HashMap<>();
        systemMetrics.put("jvmFreeMemory", Runtime.getRuntime().freeMemory() / (1024 * 1024) + " MB");
        systemMetrics.put("jvmTotalMemory", Runtime.getRuntime().totalMemory() / (1024 * 1024) + " MB");
        systemMetrics.put("jvmMaxMemory", Runtime.getRuntime().maxMemory() / (1024 * 1024) + " MB");
        response.setSystemMetrics(systemMetrics);
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/health")
    @Operation(
            summary = "Get health check",
            description = "Basic health check endpoint to verify the API is running"
    )
    public ResponseEntity<ApiResponse> healthCheck() {
        ApiResponse response = new ApiResponse(true, "API is running normally");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get all users",
        description = "Get a list of all users in the system",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        long userCount = memberRepository.count();
        Map<String, Object> response = new HashMap<>();
        response.put("length", userCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/threads-count")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get thread count",
        description = "Get the total number of threads in the system",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getThreadCount() {
        long threadCount = threadRepository.count();
        Map<String, Object> response = new HashMap<>();
        response.put("length", threadCount);
        return ResponseEntity.ok(response);
    }
} 