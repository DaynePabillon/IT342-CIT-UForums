package edu.cit.citforums.controller;

import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.dto.request.ThreadRequest;
import edu.cit.citforums.service.ThreadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/threads")
public class ApiThreadController {

    @Autowired
    private ThreadService threadService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThreadDto> createThread(@Valid @RequestBody ThreadRequest threadRequest, Principal principal) {
        // In a real implementation, you'd get the user ID from the Principal
        Long currentUserId = 1L; // This should be retrieved from authenticated user
        
        ThreadDto createdThread = threadService.createThread(threadRequest, currentUserId);
        return new ResponseEntity<>(createdThread, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<PagedResponseDto<ThreadDto>> getRecentThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ThreadDto> threads = threadService.getRecentThreads(page, size);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<ThreadDto>> getRecentThreadsLimit(
            @RequestParam(defaultValue = "5") int limit) {
        
        List<ThreadDto> threads = threadService.getRecentThreadsLimit(limit);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/forum/{forumId}")
    public ResponseEntity<PagedResponseDto<ThreadDto>> getThreadsByForum(
            @PathVariable Long forumId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ThreadDto> threads = threadService.getThreadsByForum(forumId, page, size);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ThreadDto> getThreadById(@PathVariable("id") Long id) {
        threadService.incrementThreadViewCount(id);
        ThreadDto thread = threadService.getThread(id);
        return ResponseEntity.ok(thread);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThreadDto> updateThread(
            @PathVariable("id") Long id,
            @Valid @RequestBody ThreadRequest threadRequest) {
        
        ThreadDto updatedThread = threadService.updateThread(id, threadRequest);
        return ResponseEntity.ok(updatedThread);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteThread(@PathVariable("id") Long id) {
        threadService.deleteThread(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/pin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> pinThread(@PathVariable("id") Long id) {
        threadService.pinThread(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/unpin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unpinThread(@PathVariable("id") Long id) {
        threadService.unpinThread(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> lockThread(@PathVariable("id") Long id) {
        threadService.lockThread(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockThread(@PathVariable("id") Long id) {
        threadService.unlockThread(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<PagedResponseDto<ThreadDto>> searchThreads(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ThreadDto> threads = threadService.searchThreads(query, page, size);
        return ResponseEntity.ok(threads);
    }
} 