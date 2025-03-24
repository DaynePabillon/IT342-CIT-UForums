package edu.cit.citforums.controller;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.request.ForumRequest;
import edu.cit.citforums.service.ForumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/forums")
public class ApiForumController {

    @Autowired
    private ForumService forumService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ForumDto> createForum(@Valid @RequestBody ForumRequest forumRequest, Principal principal) {
        // In a real implementation, you'd get the user ID from the Principal
        // For now, we're using a placeholder user ID
        Long currentUserId = 1L; // This should be retrieved from authenticated user
        
        ForumDto createdForum = forumService.createForum(forumRequest, currentUserId);
        return new ResponseEntity<>(createdForum, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<PagedResponseDto<ForumDto>> getAllForums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ForumDto> forums = forumService.getAllForums(page, size);
        return ResponseEntity.ok(forums);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<ForumDto>> getAllActiveForums() {
        List<ForumDto> forums = forumService.getAllActiveForums();
        return ResponseEntity.ok(forums);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ForumDto> getForumById(@PathVariable("id") Long id) {
        ForumDto forum = forumService.getForum(id);
        return ResponseEntity.ok(forum);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ForumDto> updateForum(
            @PathVariable("id") Long id,
            @Valid @RequestBody ForumRequest forumRequest) {
        
        ForumDto updatedForum = forumService.updateForum(id, forumRequest);
        return ResponseEntity.ok(updatedForum);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteForum(@PathVariable("id") Long id) {
        forumService.deleteForum(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleForumStatus(@PathVariable("id") Long id) {
        forumService.toggleForumStatus(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<PagedResponseDto<ForumDto>> searchForums(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ForumDto> forums = forumService.searchForums(query, page, size);
        return ResponseEntity.ok(forums);
    }
} 