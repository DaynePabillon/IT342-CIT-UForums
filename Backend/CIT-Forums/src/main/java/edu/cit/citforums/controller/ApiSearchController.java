package edu.cit.citforums.controller;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.PostDto;
import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.service.ForumService;
import edu.cit.citforums.service.PostService;
import edu.cit.citforums.service.ThreadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiSearchController {

    @Autowired
    private ForumService forumService;
    
    @Autowired
    private ThreadService threadService;
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> searchAll(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        
        Page<ForumDto> forums = forumService.searchForums(query, page, size);
        Page<ThreadDto> threads = threadService.searchThreads(query, page, size);
        Page<PostDto> posts = postService.searchPosts(query, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("forums", forums);
        response.put("threads", threads);
        response.put("posts", posts);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/forums")
    public ResponseEntity<Page<ForumDto>> searchForums(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.searchForums(query, page, size));
    }
    
    @GetMapping("/threads")
    public ResponseEntity<Page<ThreadDto>> searchThreads(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(threadService.searchThreads(query, page, size));
    }
    
    @GetMapping("/posts")
    public ResponseEntity<Page<PostDto>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.searchPosts(query, page, size));
    }
} 