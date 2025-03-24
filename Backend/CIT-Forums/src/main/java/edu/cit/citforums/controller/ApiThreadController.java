package edu.cit.citforums.controller;

import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.dto.request.ThreadRequest;
import edu.cit.citforums.service.ThreadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/threads")
public class ApiThreadController {

    @Autowired
    private ThreadService threadService;
    
    @PostMapping("/forum/{forumId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThreadDto> createThread(
            @Valid @RequestBody ThreadRequest threadRequest,
            @PathVariable Long forumId,
            Principal principal) {
        // TODO: Get actual user ID from Principal
        Long currentUserId = 1L; // Placeholder - should be retrieved from authenticated user
        
        ThreadDto createdThread = threadService.createThread(threadRequest, forumId, currentUserId);
        return new ResponseEntity<>(createdThread, HttpStatus.CREATED);
    }
    
    @GetMapping("/forum/{forumId}")
    public ResponseEntity<Page<ThreadDto>> getThreadsByForum(
            @PathVariable Long forumId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ThreadDto> threads = threadService.getThreadsByForum(forumId, page, size);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ThreadDto> getThreadById(@PathVariable("id") Long id) {
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
    
    @GetMapping("/search")
    public ResponseEntity<Page<ThreadDto>> searchThreads(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ThreadDto> threads = threadService.searchThreads(query, page, size);
        return ResponseEntity.ok(threads);
    }
} 