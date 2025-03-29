package edu.cit.citforums.controller;

import edu.cit.citforums.dto.response.ForumSummaryDTO;
import edu.cit.citforums.models.Forum;
import edu.cit.citforums.repository.CommentRepository;
import edu.cit.citforums.repository.ForumRepository;
import edu.cit.citforums.repository.ThreadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Content Management", description = "Forums and content administration endpoints")
public class AdminContentController {

    private final ForumRepository forumRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public AdminContentController(
            ForumRepository forumRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository) {
        this.forumRepository = forumRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping("/forums/inactive")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get inactive forums",
        description = "Get forums that have been inactive for a specified period",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<List<ForumSummaryDTO>> getInactiveForums(
            @Parameter(description = "Inactivity period in days", example = "30")
            @RequestParam(defaultValue = "30") int days) {
        
        // Calculate the threshold date for inactivity
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(days);
        
        // Find forums that have had no activity since the threshold date
        List<Forum> inactiveForums = forumRepository.findForumsWithNoActivitySince(thresholdDate);
        
        // Convert to DTOs
        List<ForumSummaryDTO> forumSummaries = inactiveForums.stream()
                .map(this::convertToForumSummary)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(forumSummaries);
    }
    
    private ForumSummaryDTO convertToForumSummary(Forum forum) {
        ForumSummaryDTO dto = new ForumSummaryDTO();
        dto.setId(forum.getId());
        dto.setTitle(forum.getTitle());
        dto.setDescription(forum.getDescription());
        
        // Count threads and comments in this forum
        Long threadCount = threadRepository.countByForumId(forum.getId());
        Long commentCount = commentRepository.countByForumId(forum.getId());
        
        dto.setThreadCount(threadCount != null ? threadCount.intValue() : 0);
        dto.setCommentCount(commentCount != null ? commentCount.intValue() : 0);
        
        // Format dates
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        dto.setCreatedAt(forum.getCreatedAt().format(formatter));
        
        // Get the last activity date
        LocalDateTime lastActivity = forum.getLastActivity();
        if (lastActivity != null) {
            dto.setLastActivity(lastActivity.format(formatter));
        }
        
        return dto;
    }
} 