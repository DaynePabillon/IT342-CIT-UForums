package edu.cit.backend3.controller;

import edu.cit.backend3.dto.PostDto;
import edu.cit.backend3.dto.request.PostRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.service.MemberService;
import edu.cit.backend3.service.PostService;
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
    
    @Autowired
    private MemberService memberService;
    
    @PostMapping("/thread/{threadId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody PostRequest postRequest,
            @PathVariable Long threadId,
            Principal principal) {
        
        // Get the authenticated user's email from the Principal
        String userEmail = principal.getName();
        
        // Get the member entity from the email
        Member member = memberService.findByNameOrEmail(null, userEmail);
        if (member == null) {
            throw new RuntimeException("User not found");
        }
        
        PostDto createdPost = postService.createPost(postRequest, threadId, member.getId());
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
    
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDto> togglePostStatus(@PathVariable("id") Long id) {
        PostDto updatedPost = postService.togglePostStatus(id);
        return ResponseEntity.ok(updatedPost);
    }
} 