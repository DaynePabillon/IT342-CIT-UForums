package edu.cit.backend3.controller;

import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.request.ThreadRequest;
import edu.cit.backend3.service.ThreadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Thread", description = "Thread management APIs")
public class ApiThreadController {

    @Autowired
    private ThreadService threadService;
    
    @Operation(summary = "Create a new thread", description = "Creates a new thread in a specific forum")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Thread created successfully",
                    content = @Content(schema = @Schema(implementation = ThreadDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    @PostMapping("/forum/{forumId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThreadDto> createThread(
            @Parameter(description = "Thread details") @Valid @RequestBody ThreadRequest threadRequest,
            @Parameter(description = "Forum ID") @PathVariable Long forumId,
            Principal principal) {
        // TODO: Get actual user ID from Principal
        Long currentUserId = 1L; // Placeholder - should be retrieved from authenticated user
        
        ThreadDto createdThread = threadService.createThread(threadRequest, forumId, currentUserId);
        return new ResponseEntity<>(createdThread, HttpStatus.CREATED);
    }
    
    @Operation(summary = "Get threads by forum", description = "Returns a paginated list of threads in a specific forum")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Threads retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "404", description = "Forum not found")
    })
    @GetMapping("/forum/{forumId}")
    public ResponseEntity<Page<ThreadDto>> getThreadsByForum(
            @Parameter(description = "Forum ID") @PathVariable Long forumId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        Page<ThreadDto> threads = threadService.getThreadsByForum(forumId, page, size);
        return ResponseEntity.ok(threads);
    }
    
    @Operation(summary = "Get thread by ID", description = "Returns a thread by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thread found",
                    content = @Content(schema = @Schema(implementation = ThreadDto.class))),
        @ApiResponse(responseCode = "404", description = "Thread not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ThreadDto> getThreadById(
            @Parameter(description = "Thread ID") @PathVariable("id") Long id) {
        ThreadDto thread = threadService.getThread(id);
        return ResponseEntity.ok(thread);
    }
    
    @Operation(summary = "Update thread", description = "Updates an existing thread")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Thread updated successfully",
                    content = @Content(schema = @Schema(implementation = ThreadDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Thread not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ThreadDto> updateThread(
            @Parameter(description = "Thread ID") @PathVariable("id") Long id,
            @Parameter(description = "Updated thread details") @Valid @RequestBody ThreadRequest threadRequest) {
        
        ThreadDto updatedThread = threadService.updateThread(id, threadRequest);
        return ResponseEntity.ok(updatedThread);
    }
    
    @Operation(summary = "Delete thread", description = "Deletes an existing thread")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Thread deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Thread not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteThread(
            @Parameter(description = "Thread ID") @PathVariable("id") Long id) {
        threadService.deleteThread(id);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "Search threads", description = "Search threads by query string")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class)))
    })
    @GetMapping("/search")
    public ResponseEntity<Page<ThreadDto>> searchThreads(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        Page<ThreadDto> threads = threadService.searchThreads(query, page, size);
        return ResponseEntity.ok(threads);
    }
} 