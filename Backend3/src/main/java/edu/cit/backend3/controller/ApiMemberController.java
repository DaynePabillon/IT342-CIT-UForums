package edu.cit.backend3.controller;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.dto.request.ProfileUpdateRequest;
import edu.cit.backend3.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/members")
@Tag(name = "Users", description = "Operations for user management and profile operations")
public class ApiMemberController {

    private static final Logger logger = LoggerFactory.getLogger(ApiMemberController.class);

    @Autowired
    private MemberService memberService;
    
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get current user profile",
        description = "Retrieves the profile information of the currently authenticated user",
        security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved user profile",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<?> getCurrentMember(Principal principal) {
        if (principal == null) {
            logger.warn("User is not authenticated (principal is null)");
            return ResponseEntity.status(401).body("User is not authenticated");
        }
        
        String username = principal.getName();
        logger.info("Getting current member info for: {}", username);
        
        try {
            MemberDto memberDto = memberService.getMemberByUsernameOrEmail(username);
            if (memberDto == null) {
                logger.error("Member not found for authenticated user: {}", username);
                return ResponseEntity.status(404).body("Member not found");
            }
            
            logger.info("Successfully retrieved member: id={}, username={}", memberDto.getId(), memberDto.getUsername());
            return ResponseEntity.ok(memberDto);
        } catch (Exception e) {
            logger.error("Error getting current member", e);
            return ResponseEntity.status(500).body("Error getting current member: " + e.getMessage());
        }
    }
    
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Update user profile",
        description = "Updates the profile information of the currently authenticated user",
        security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Profile updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<MemberDto> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest updateRequest,
            Principal principal) {
        MemberDto currentMember = memberService.getMemberByUsernameOrEmail(principal.getName());
        MemberDto updatedMember = memberService.updateProfile(currentMember.getId(), updateRequest);
        return ResponseEntity.ok(updatedMember);
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Get user by ID",
        description = "Retrieves a user's public profile information by their ID"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved user",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<MemberDto> getMemberById(
            @Parameter(description = "ID of the user to retrieve", required = true)
            @PathVariable("id") Long id) {
        MemberDto member = memberService.getMember(id);
        return ResponseEntity.ok(member);
    }
    
    @GetMapping("/name/{name}")
    @Operation(
        summary = "Get user by username",
        description = "Retrieves a user's public profile information by their username"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved user",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<MemberDto> getMemberByName(
            @Parameter(description = "Username of the user to retrieve", required = true)
            @PathVariable("name") String name) {
        MemberDto member = memberService.getMemberByName(name);
        return ResponseEntity.ok(member);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #id")
    @Operation(
        summary = "Update user",
        description = "Updates a user's information (only accessible by the user themselves)",
        security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "User updated successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - cannot update other users")
    })
    public ResponseEntity<MemberDto> updateMember(
            @Parameter(description = "ID of the user to update", required = true)
            @PathVariable("id") Long id,
            @Valid @RequestBody MemberRegistrationRequest updateRequest) {
        
        MemberDto updatedMember = memberService.updateMember(id, updateRequest);
        return ResponseEntity.ok(updatedMember);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("authentication.principal.id == #id")
    @Operation(
        summary = "Delete user",
        description = "Deletes a user account (only accessible by the user themselves)",
        security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204", 
            description = "User deleted successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden - cannot delete other users")
    })
    public ResponseEntity<Void> deleteMember(
            @Parameter(description = "ID of the user to delete", required = true)
            @PathVariable("id") Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/check-username")
    @Operation(
        summary = "Check if username exists",
        description = "Checks if a username is already taken"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Check completed",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Boolean.class))
        )
    })
    public ResponseEntity<Boolean> checkUsernameExists(
            @Parameter(description = "Username to check", required = true)
            @RequestParam String name) {
        boolean exists = memberService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/check-email")
    @Operation(
        summary = "Check if email exists",
        description = "Checks if an email address is already registered"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Check completed",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Boolean.class))
        )
    })
    public ResponseEntity<Boolean> checkEmailExists(
            @Parameter(description = "Email to check", required = true)
            @RequestParam String email) {
        boolean exists = memberService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/me/threads")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get current user's threads",
        description = "Retrieves all threads created by the currently authenticated user",
        security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved threads",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<ThreadDto>> getCurrentMemberThreads(
            @Parameter(description = "Page number (zero-based)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") 
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        MemberDto member = memberService.getMemberByUsernameOrEmail(principal.getName());
        Page<ThreadDto> threads = memberService.getMemberThreads(member.getId(), page, size);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/me/comments")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get current user's comments",
        description = "Retrieves all comments created by the currently authenticated user",
        security = { @SecurityRequirement(name = "bearerAuth") }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved comments",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<CommentDto>> getCurrentMemberComments(
            @Parameter(description = "Page number (zero-based)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") 
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        MemberDto member = memberService.getMemberByUsernameOrEmail(principal.getName());
        Page<CommentDto> comments = memberService.getMemberComments(member.getId(), page, size);
        return ResponseEntity.ok(comments);
    }
}