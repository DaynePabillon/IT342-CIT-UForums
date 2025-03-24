package edu.cit.citforums.controller;

import edu.cit.citforums.dto.response.UserSummaryDTO;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.repository.CommentRepository;
import edu.cit.citforums.repository.MemberRepository;
import edu.cit.citforums.repository.ThreadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "User Management", description = "User administration endpoints")
public class AdminUserController {

    private final MemberRepository memberRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public AdminUserController(
            MemberRepository memberRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository) {
        this.memberRepository = memberRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get all users",
        description = "Retrieve a paginated list of all users with optional filters",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field and direction (e.g., createdAt,desc)")
            @RequestParam(required = false) String sort) {
        
        // Create pageable with sort if provided
        Pageable pageable;
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            String sortField = sortParts[0];
            Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        } else {
            pageable = PageRequest.of(page, size);
        }
        
        // Fetch users with pagination
        Page<Member> usersPage = memberRepository.findAll(pageable);
        
        // Convert to UserSummaryDTO
        List<UserSummaryDTO> users = usersPage.getContent().stream()
                .map(this::convertToUserSummary)
                .collect(Collectors.toList());
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("content", users);
        response.put("totalElements", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("size", usersPage.getSize());
        response.put("number", usersPage.getNumber());
        
        return ResponseEntity.ok(response);
    }
    
    private UserSummaryDTO convertToUserSummary(Member member) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(member.getId());
        dto.setUsername(member.getUsername());
        dto.setEmail(member.getEmail());
        // Set fullName if available, or combine first and last name
        if (member.getFirstName() != null || member.getLastName() != null) {
            String fullName = (member.getFirstName() != null ? member.getFirstName() : "") 
                + " " + (member.getLastName() != null ? member.getLastName() : "");
            dto.setFullName(fullName.trim());
        }
        
        // Set roles - assuming roles are stored in a collection
        if (member.getRoles() != null) {
            dto.setRoles(member.getRoles().stream()
                .map(role -> role.getName().toString())
                .collect(Collectors.toList()));
        }
        
        dto.setActive(member.isActive());
        dto.setCreatedAt(member.getCreatedAt().toString());
        // Set last login if available
        if (member.getLastLogin() != null) {
            dto.setLastLogin(member.getLastLogin().toString());
        }
        
        // Count threads and comments
        Long threadCount = threadRepository.countByAuthorId(member.getId());
        Long commentCount = commentRepository.countByAuthorId(member.getId());
        
        dto.setThreadCount(threadCount != null ? threadCount.intValue() : 0);
        dto.setCommentCount(commentCount != null ? commentCount.intValue() : 0);
        
        return dto;
    }
} 