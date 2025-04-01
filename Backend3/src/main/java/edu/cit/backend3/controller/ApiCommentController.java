package edu.cit.backend3.controller;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.PagedResponseDto;
import edu.cit.backend3.dto.request.CommentRequest;
import edu.cit.backend3.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class ApiCommentController {

    @Autowired
    private CommentService commentService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> createComment(@Valid @RequestBody CommentRequest commentRequest, Principal principal) {
        // In a real implementation, you'd get the user ID from the Principal
        Long currentUserId = 1L; // This should be retrieved from authenticated user
        
        CommentDto createdComment = commentService.createComment(commentRequest, currentUserId);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDto> comments = commentService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/post/{postId}/paged")
    public ResponseEntity<PagedResponseDto<CommentDto>> getCommentsByPostPaged(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<CommentDto> comments = commentService.getCommentsByPostPaged(postId, page, size);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/author/{authorId}")
    public ResponseEntity<PagedResponseDto<CommentDto>> getCommentsByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<CommentDto> comments = commentService.getCommentsByAuthor(authorId, page, size);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable("id") Long id) {
        CommentDto comment = commentService.getComment(id);
        return ResponseEntity.ok(comment);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable("id") Long id,
            @Valid @RequestBody CommentRequest commentRequest) {
        
        CommentDto updatedComment = commentService.updateComment(id, commentRequest);
        return ResponseEntity.ok(updatedComment);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
} 