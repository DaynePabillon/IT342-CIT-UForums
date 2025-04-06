package edu.cit.backend3.controller;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.request.CommentRequest;
import edu.cit.backend3.service.CommentService;
import edu.cit.backend3.service.MemberService;
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
@RequestMapping("/api/comments")
@Tag(name = "Comment", description = "Comment management APIs")
public class ApiCommentController {

    @Autowired
    private CommentService commentService;
    
    @Autowired
    private MemberService memberService;

    @Operation(summary = "Create a new comment", description = "Creates a new comment on a post")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Comment created successfully",
                    content = @Content(schema = @Schema(implementation = CommentDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Post not found")
    })
    @PostMapping("/post/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> createComment(
            @Parameter(description = "Comment details") @Valid @RequestBody CommentRequest commentRequest,
            @Parameter(description = "Post ID") @PathVariable Long postId,
            Principal principal) {
        Long currentUserId = memberService.getMemberByUsernameOrEmail(principal.getName()).getId();
        CommentDto createdComment = commentService.createComment(commentRequest, postId, currentUserId);
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }

    @Operation(summary = "Get comments by thread", description = "Returns a paginated list of comments in a thread")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "404", description = "Thread not found")
    })
    @GetMapping("/thread/{threadId}")
    public ResponseEntity<Page<CommentDto>> getCommentsByThread(
            @Parameter(description = "Thread ID") @PathVariable Long threadId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Page<CommentDto> comments = commentService.getCommentsByThread(threadId, page, size);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "Get comments by post", description = "Returns a paginated list of comments on a post")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "404", description = "Post not found")
    })
    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<CommentDto>> getCommentsByPost(
            @Parameter(description = "Post ID") @PathVariable Long postId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Page<CommentDto> comments = commentService.getCommentsByPost(postId, page, size);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "Get user's comments", description = "Returns a paginated list of comments created by the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comments retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<CommentDto>> getCurrentUserComments(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        Long currentUserId = memberService.getMemberByUsernameOrEmail(principal.getName()).getId();
        Page<CommentDto> comments = commentService.getCommentsByAuthor(currentUserId, page, size);
        return ResponseEntity.ok(comments);
    }

    @Operation(summary = "Get comment by ID", description = "Returns a comment by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment found",
                    content = @Content(schema = @Schema(implementation = CommentDto.class))),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable("id") Long id) {
        CommentDto comment = commentService.getComment(id);
        return ResponseEntity.ok(comment);
    }

    @Operation(summary = "Update comment", description = "Updates an existing comment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Comment updated successfully",
                    content = @Content(schema = @Schema(implementation = CommentDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable("id") Long id,
            @Valid @RequestBody CommentRequest commentRequest) {
        CommentDto updatedComment = commentService.updateComment(id, commentRequest);
        return ResponseEntity.ok(updatedComment);
    }

    @Operation(summary = "Delete comment", description = "Deletes an existing comment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
} 