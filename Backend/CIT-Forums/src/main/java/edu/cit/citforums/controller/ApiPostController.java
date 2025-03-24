package edu.cit.citforums.controller;

import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.PostDto;
import edu.cit.citforums.dto.request.PostRequest;
import edu.cit.citforums.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class ApiPostController {

    @Autowired
    private PostService postService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> createPost(@Valid @RequestBody PostRequest postRequest, Principal principal) {
        // In a real implementation, you'd get the user ID from the Principal
        Long currentUserId = 1L; // This should be retrieved from authenticated user
        
        PostDto createdPost = postService.createPost(postRequest, currentUserId);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
    
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<PagedResponseDto<PostDto>> getPostsByThread(
            @PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<PostDto> posts = postService.getPostsByThread(threadId, page, size);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/thread/{threadId}/all")
    public ResponseEntity<List<PostDto>> getAllPostsByThread(@PathVariable Long threadId) {
        List<PostDto> posts = postService.getAllPostsByThread(threadId);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/author/{authorId}")
    public ResponseEntity<PagedResponseDto<PostDto>> getPostsByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<PostDto> posts = postService.getPostsByAuthor(authorId, page, size);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable("id") Long id) {
        PostDto post = postService.getPost(id);
        return ResponseEntity.ok(post);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable("id") Long id,
            @Valid @RequestBody PostRequest postRequest) {
        
        PostDto updatedPost = postService.updatePost(id, postRequest);
        return ResponseEntity.ok(updatedPost);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<PagedResponseDto<PostDto>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<PostDto> posts = postService.searchPosts(query, page, size);
        return ResponseEntity.ok(posts);
    }
} 