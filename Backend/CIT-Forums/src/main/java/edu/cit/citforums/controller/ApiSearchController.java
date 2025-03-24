package edu.cit.citforums.controller;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.PostDto;
import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.service.ForumService;
import edu.cit.citforums.service.PostService;
import edu.cit.citforums.service.ThreadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
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
        
        PagedResponseDto<ForumDto> forums = forumService.searchForums(query, page, size);
        PagedResponseDto<ThreadDto> threads = threadService.searchThreads(query, page, size);
        PagedResponseDto<PostDto> posts = postService.searchPosts(query, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("forums", forums);
        response.put("threads", threads);
        response.put("posts", posts);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/forums")
    public ResponseEntity<PagedResponseDto<ForumDto>> searchForums(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ForumDto> forums = forumService.searchForums(query, page, size);
        return ResponseEntity.ok(forums);
    }
    
    @GetMapping("/threads")
    public ResponseEntity<PagedResponseDto<ThreadDto>> searchThreads(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<ThreadDto> threads = threadService.searchThreads(query, page, size);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/posts")
    public ResponseEntity<PagedResponseDto<PostDto>> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponseDto<PostDto> posts = postService.searchPosts(query, page, size);
        return ResponseEntity.ok(posts);
    }
} 