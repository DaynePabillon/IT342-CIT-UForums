package edu.cit.citforums.controller;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.dto.request.ForumRequest;
import edu.cit.citforums.models.ForumCategory;
import edu.cit.citforums.service.ForumService;
import edu.cit.citforums.service.MemberService;
import edu.cit.citforums.service.ThreadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/forums")
@CrossOrigin(origins = "http://localhost:3000")
public class ApiForumController {

    @Autowired
    private ForumService forumService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private ThreadService threadService;
    
    @PostMapping("/delete-first-general")
    public ResponseEntity<Void> deleteFirstGeneralForum() {
        forumService.deleteFirstForumByCategory(ForumCategory.GENERAL);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping
    public ResponseEntity<ForumDto> createForum(@RequestBody ForumRequest forumRequest, Principal principal) {
        Long userId = memberService.getMemberByEmail(principal.getName()).getId();
        return ResponseEntity.ok(forumService.createForum(forumRequest, userId));
    }
    
    @GetMapping
    public ResponseEntity<Page<ForumDto>> getAllForums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.getAllForums(page, size));
    }
    
    @GetMapping("/active")
    public ResponseEntity<Page<ForumDto>> getAllActiveForums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.getAllForums(page, size));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ForumDto> getForum(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getForum(id));
    }

    @GetMapping("/{id}/threads")
    public ResponseEntity<Page<ThreadDto>> getForumThreads(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(threadService.getThreadsByForum(id, page, size));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ForumDto> updateForum(@PathVariable Long id, @RequestBody ForumRequest forumRequest) {
        return ResponseEntity.ok(forumService.updateForum(id, forumRequest));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForum(@PathVariable Long id) {
        forumService.deleteForum(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<ForumDto>> searchForums(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.searchForums(query, page, size));
    }
} 