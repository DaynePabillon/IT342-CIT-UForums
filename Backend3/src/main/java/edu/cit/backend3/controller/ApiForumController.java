package edu.cit.backend3.controller;

import edu.cit.backend3.dto.ForumDto;
import edu.cit.backend3.dto.PagedResponseDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.request.ForumRequest;
import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.ForumCategory;
import edu.cit.backend3.service.ForumService;
import edu.cit.backend3.service.MemberService;
import edu.cit.backend3.service.ThreadService;
import edu.cit.backend3.repository.ForumCategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forums")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Forum", description = "Forum management APIs")
public class ApiForumController {

    @Autowired
    private ForumService forumService;

    @Autowired
    private MemberService memberService;

    @Autowired
    private ThreadService threadService;
    
    @Autowired
    private ForumCategoryRepository forumCategoryRepository;
    
    @Operation(summary = "Delete first general forum", description = "Deletes the first forum with GENERAL category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forum deleted successfully"),
        @ApiResponse(responseCode = "404", description = "No general forum found")
    })
    @PostMapping("/delete-first-general")
    public ResponseEntity<Void> deleteFirstGeneralForum() {
        List<ForumCategory> generalCategories = forumCategoryRepository.findByName("GENERAL");
        
        if (generalCategories.isEmpty()) {
            throw new RuntimeException("General category not found");
        }
        
        ForumCategory generalCategory = generalCategories.get(0);
        forumService.deleteFirstForumByCategory(generalCategory);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Create a new forum", description = "Creates a new forum with the given details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forum created successfully",
                    content = @Content(schema = @Schema(implementation = ForumDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<ForumDto> createForum(
            @Parameter(description = "Forum details") @RequestBody ForumRequest forumRequest,
            Principal principal) {
        Long userId = memberService.getMemberByUsernameOrEmail(principal.getName()).getId();
        return ResponseEntity.ok(forumService.createForum(forumRequest, userId));
    }
    
    @Operation(summary = "Get all forums", description = "Returns a paginated list of all forums")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forums retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    @GetMapping
    public ResponseEntity<Page<ForumDto>> getAllForums(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.getAllForums(page, size));
    }
    
    @Operation(summary = "Get all active forums", description = "Returns a paginated list of all active forums")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Active forums retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/active")
    public ResponseEntity<Page<ForumDto>> getAllActiveForums(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.getAllForums(page, size));
    }
    
    @Operation(summary = "Get forum by ID", description = "Returns a forum by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forum found",
                    content = @Content(schema = @Schema(implementation = ForumDto.class))),
        @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ForumDto> getForum(
            @Parameter(description = "Forum ID") @PathVariable Long id) {
        return ResponseEntity.ok(forumService.getForum(id));
    }

    @Operation(summary = "Get forum threads", description = "Returns a paginated list of threads in a forum")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Threads retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    @GetMapping("/{id}/threads")
    public ResponseEntity<Page<ThreadDto>> getForumThreads(
            @Parameter(description = "Forum ID") @PathVariable Long id,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(threadService.getThreadsByForum(id, page, size));
    }
    
    @Operation(summary = "Update forum", description = "Updates an existing forum")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forum updated successfully",
                    content = @Content(schema = @Schema(implementation = ForumDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ForumDto> updateForum(
            @Parameter(description = "Forum ID") @PathVariable Long id,
            @Parameter(description = "Updated forum details") @RequestBody ForumRequest forumRequest) {
        return ResponseEntity.ok(forumService.updateForum(id, forumRequest));
    }
    
    @Operation(summary = "Delete forum", description = "Deletes an existing forum")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Forum deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForum(
            @Parameter(description = "Forum ID") @PathVariable Long id) {
        forumService.deleteForum(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Search forums", description = "Search forums by query string")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/search")
    public ResponseEntity<Page<ForumDto>> searchForums(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.searchForums(query, page, size));
    }

    @Operation(summary = "Clean up duplicate GENERAL forums", description = "Removes duplicate forums in the GENERAL category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cleanup completed successfully")
    })
    @PostMapping("/cleanup-general")
    public ResponseEntity<String> cleanupGeneralForums() {
        List<ForumCategory> generalCategories = forumCategoryRepository.findByName("GENERAL");
        
        if (generalCategories.isEmpty()) {
            throw new RuntimeException("General category not found");
        }
        
        ForumCategory generalCategory = generalCategories.get(0);
        List<Forum> generalForums = forumService.getForumsByCategory(generalCategory);
        
        // Keep the first one, delete the rest
        if (generalForums.size() > 1) {
            for (int i = 1; i < generalForums.size(); i++) {
                forumService.deleteForum(generalForums.get(i).getId());
            }
            return ResponseEntity.ok("Cleaned up " + (generalForums.size() - 1) + " duplicate GENERAL forums");
        }
        
        return ResponseEntity.ok("No duplicate GENERAL forums found");
    }

    @GetMapping("/category/{categoryName}")
    public ResponseEntity<List<ForumDto>> getForumsByCategory(@PathVariable String categoryName) {
        List<ForumCategory> categories = forumCategoryRepository.findByName(categoryName);
        
        if (categories.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Use the first category found (after cleanup, there should only be one)
        ForumCategory category = categories.get(0);
        return ResponseEntity.ok(forumService.getForumsByCategoryDto(category));
    }
} 