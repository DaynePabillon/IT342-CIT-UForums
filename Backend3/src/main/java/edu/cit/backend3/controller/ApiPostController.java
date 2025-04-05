package edu.cit.backend3.controller;

import edu.cit.backend3.dto.PostDto;
import edu.cit.backend3.dto.request.PostRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.service.MemberService;
import edu.cit.backend3.service.PostService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(ApiPostController.class);

    @Autowired
    private PostService postService;
    
    @Autowired
    private MemberService memberService;
    
    @PostMapping("/thread/{threadId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody PostRequest postRequest,
            @PathVariable Long threadId,
            Principal principal) {
        
        logger.info("Received post creation request - Thread ID: {}, Content length: {}", 
            threadId, postRequest.getContent().length());
        
        // Get the authenticated user's email from the Principal
        String userEmail = principal.getName();
        logger.info("Authenticated user: {}", userEmail);
        
        try {
            // Get the member entity from the email
            Member member = memberService.findByNameOrEmail(null, userEmail);
            logger.info("Found member with ID: {}", member.getId());
            
            PostDto createdPost = postService.createPost(postRequest, threadId, member.getId());
            logger.info("Post created successfully with ID: {}", createdPost.getId());
            return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            logger.error("Error creating post: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            logger.error("Error creating post: {}", e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
    
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDto> togglePostStatus(@PathVariable("id") Long id) {
        PostDto updatedPost = postService.togglePostStatus(id);
        return ResponseEntity.ok(updatedPost);
    }
} 