package edu.cit.backend3.controller;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.response.ApiResponse;
import edu.cit.backend3.dto.response.SystemStatusResponse;
import edu.cit.backend3.models.Comment;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Post;
import edu.cit.backend3.models.Report;
import edu.cit.backend3.models.Thread;
import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.ForumRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.PostRepository;
import edu.cit.backend3.repository.ReportRepository;
import edu.cit.backend3.repository.ThreadRepository;
import edu.cit.backend3.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Dashboard", description = "Admin dashboard statistics endpoints")
public class AdminDashboardController {

    private final ForumRepository forumRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;
    private final MemberRepository memberRepository;
    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final MemberService memberService;
    private final LocalDateTime applicationStartTime = LocalDateTime.now();
    private static final Logger log = LoggerFactory.getLogger(AdminDashboardController.class);

    @Autowired
    public AdminDashboardController(
            ForumRepository forumRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository,
            MemberRepository memberRepository,
            ReportRepository reportRepository,
            PostRepository postRepository,
            MemberService memberService) {
        this.forumRepository = forumRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.memberRepository = memberRepository;
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.memberService = memberService;
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
        response.put("count", userCount);
        
        // Get recent users
        List<Member> recentUsers = memberRepository.findAll(
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        List<Map<String, Object>> recentUsersList = recentUsers.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getName());
                userMap.put("email", user.getEmail());
                userMap.put("createdAt", user.getCreatedAt());
                return userMap;
            })
            .collect(Collectors.toList());
        
        response.put("recentUsers", recentUsersList);
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
        response.put("count", threadCount);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/reports")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get reports",
        description = "Get reports information including count, active reports, and recent reports",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Page<Report>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Report> reports = reportRepository.findAll(pageable);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error getting reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get dashboard overview",
        description = "Get all dashboard statistics in a single call",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        // Get counts
        long totalUsers = memberRepository.count();
        long totalThreads = threadRepository.count();
        long totalReports = reportRepository.count();
        long activeReports = reportRepository.countByStatus("PENDING");
        
        // Get recent reports
        List<Report> recentReports = reportRepository.findAll(
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        List<Map<String, Object>> recentReportsList = recentReports.stream()
            .map(report -> {
                Map<String, Object> reportMap = new HashMap<>();
                reportMap.put("id", report.getId());
                reportMap.put("contentType", report.getContentType());
                reportMap.put("contentId", report.getContentId());
                reportMap.put("reason", report.getReason());
                reportMap.put("status", report.getStatus());
                reportMap.put("createdAt", report.getCreatedAt());
                
                if (report.getReporter() != null) {
                    Map<String, Object> reporter = new HashMap<>();
                    reporter.put("id", report.getReporter().getId());
                    reporter.put("username", report.getReporter().getName());
                    reportMap.put("reporter", reporter);
                }
                
                return reportMap;
            })
            .collect(Collectors.toList());
        
        // Get recent users
        List<Member> recentUsers = memberRepository.findAll(
            PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        
        List<Map<String, Object>> recentUsersList = recentUsers.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("username", user.getName());
                userMap.put("email", user.getEmail());
                userMap.put("createdAt", user.getCreatedAt());
                return userMap;
            })
            .collect(Collectors.toList());
        
        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("totalThreads", totalThreads);
        response.put("totalReports", totalReports);
        response.put("activeReports", activeReports);
        response.put("recentReports", recentReportsList);
        response.put("recentUsers", recentUsersList);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/dashboard/user-stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get user statistics",
        description = "Get basic user statistics",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getUserStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get total user count
            long totalUsers = memberRepository.count();
            stats.put("totalUsers", totalUsers);
            
            // Get recent users
            List<Member> recentUsers = memberRepository.findTop5ByOrderByCreatedAtDesc();
            stats.put("recentUsers", recentUsers);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/dashboard/forum-stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get forum statistics",
        description = "Get basic forum statistics",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getForumStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get total forum count
            long totalForums = forumRepository.count();
            stats.put("totalForums", totalForums);
            
            // Get total thread count
            long totalThreads = threadRepository.count();
            stats.put("totalThreads", totalThreads);
            
            // Get recent threads
            List<Thread> recentThreads = threadRepository.findTop5ByOrderByCreatedAtDesc();
            stats.put("recentThreads", recentThreads);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get total counts
            long totalUsers = memberRepository.count();
            long totalForums = forumRepository.count();
            long totalThreads = threadRepository.count();
            
            stats.put("totalUsers", totalUsers);
            stats.put("totalForums", totalForums);
            stats.put("totalThreads", totalThreads);
            
            // Get recent users
            List<Member> recentUsers = memberRepository.findTop5ByOrderByCreatedAtDesc();
            stats.put("recentUsers", recentUsers);
            
            // Get recent threads
            List<Thread> recentThreads = threadRepository.findTop5ByOrderByCreatedAtDesc();
            stats.put("recentThreads", recentThreads);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/dashboard-threads")
    public ResponseEntity<Page<Thread>> getThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Thread> threads = threadRepository.findAll(pageable);
            return ResponseEntity.ok(threads);
        } catch (Exception e) {
            log.error("Error getting threads", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/report-stats")
    public ResponseEntity<Map<String, Object>> getReportStats() {
        try {
            long totalReports = reportRepository.count();
            long activeReports = reportRepository.countByStatus("PENDING");
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalReports", totalReports);
            response.put("activeReports", activeReports);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting report stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/thread/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get thread by ID",
        description = "Get detailed information about a specific thread by its ID",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<?> getThreadById(@PathVariable Long id) {
        try {
            Optional<Thread> threadOpt = threadRepository.findById(id);
            if (threadOpt.isPresent()) {
                Thread thread = threadOpt.get();
                
                // Convert to DTO to avoid circular reference issues
                ThreadDto threadDto = ThreadDto.builder()
                    .id(thread.getId())
                    .title(thread.getTitle())
                    .content(thread.getContent())
                    .authorId(thread.getAuthor().getId())
                    .authorName(thread.getAuthor().getName())
                    .forumId(thread.getForum().getId())
                    .forumTitle(thread.getForum().getTitle())
                    .createdAt(thread.getCreatedAt())
                    .updatedAt(thread.getUpdatedAt())
                    .lastActivity(thread.getLastActivity())
                    .viewCount(thread.getViewCount())
                    .pinned(thread.isPinned())
                    .locked(thread.isLocked())
                    .commentCount(thread.getPosts().size())
                    .build();
                    
                return ResponseEntity.ok(threadDto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting thread by id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PutMapping("/reports/{id}/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Resolve or dismiss a report",
        description = "Resolve or dismiss a report by ID",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<?> resolveReport(
            @PathVariable Long id,
            @PathVariable String action) {
        try {
            Optional<Report> reportOpt = reportRepository.findById(id);
            if (reportOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Report report = reportOpt.get();
            
            if ("resolve".equalsIgnoreCase(action)) {
                report.setStatus("RESOLVED");
                reportRepository.save(report);
                return ResponseEntity.ok().build();
            } else if ("dismiss".equalsIgnoreCase(action)) {
                report.setStatus("DISMISSED");
                reportRepository.save(report);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().body("Invalid action. Use 'resolve' or 'dismiss'");
            }
        } catch (Exception e) {
            log.error("Error resolving report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error resolving report");
        }
    }
    
    @DeleteMapping("/threads/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Delete a thread",
        description = "Delete a thread by ID",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<?> deleteThread(@PathVariable Long id) {
        try {
            Optional<Thread> threadOpt = threadRepository.findById(id);
            if (threadOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Delete all posts and comments associated with this thread first
            Thread thread = threadOpt.get();
            
            // Get all posts for this thread with pagination
            Pageable allPosts = Pageable.unpaged(); // Get all posts without pagination
            Page<Post> postsPage = postRepository.findByThreadId(thread.getId(), allPosts);
            List<Post> posts = postsPage.getContent();
            
            for (Post post : posts) {
                // Delete all comments for this post
                List<Comment> comments = commentRepository.findByParentPostOrderByCreatedAt(post);
                commentRepository.deleteAll(comments);
            }
            
            // Now delete all posts
            postRepository.deleteAll(posts);
            
            // Finally delete the thread
            threadRepository.delete(thread);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting thread", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting thread");
        }
    }
}