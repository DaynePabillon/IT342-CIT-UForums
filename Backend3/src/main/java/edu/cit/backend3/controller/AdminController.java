package edu.cit.backend3.controller;

import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.service.ThreadService;
import edu.cit.backend3.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management", description = "Administrative operations for content management")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private ThreadService threadService;

    @GetMapping("/threads")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get all threads for admin",
        description = "Retrieves a paginated list of all threads for administrative review"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved threads",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = Page.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getAllThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ThreadDto> threads = threadService.getAllThreads(page, size);
            return ResponseEntity.ok(new ApiResponse(true, "Threads retrieved successfully", threads));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(false, "Error retrieving threads: " + e.getMessage()));
        }
    }

    // Add more admin endpoints here as needed
}