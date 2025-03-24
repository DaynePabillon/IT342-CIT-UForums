package edu.cit.citforums.controller;

import edu.cit.citforums.dto.PostDto;
import edu.cit.citforums.dto.request.PostRequest;
import edu.cit.citforums.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/posts")
public class ApiPostController {

    @Autowired
    private PostService postService;
    
    @PostMapping("/thread/{threadId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody PostRequest postRequest,
            @PathVariable Long threadId,
            Principal principal) {
        // TODO: Get actual user ID from Principal
        Long currentUserId = 1L; // Placeholder - should be retrieved from authenticated user
        
        PostDto createdPost = postService.createPost(postRequest, threadId, currentUserId);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
    
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<Page<PostDto>> getPostsByThread(
            @PathVariable Long threadId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<PostDto> posts = postService.getPostsByThread(threadId, page, size);
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
    public ResponseEntity<Page<PostDto>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<PostDto> posts = postService.searchPosts(query, page, size);
        return ResponseEntity.ok(posts);
    }
} 