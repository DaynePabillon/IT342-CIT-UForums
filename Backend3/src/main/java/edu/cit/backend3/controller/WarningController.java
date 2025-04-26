package edu.cit.backend3.controller;

import edu.cit.backend3.dto.CreateWarningRequest;
import edu.cit.backend3.dto.WarningDto;
import edu.cit.backend3.dto.response.ApiResponse;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.service.MemberService;
import edu.cit.backend3.service.WarningService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin/warnings")
@CrossOrigin(origins = {"http://localhost:3000", "https://it342-cit-uforums.onrender.com", "https://it342-cit-uforums-site.onrender.com"})
@Tag(name = "Warnings", description = "Endpoints for managing user warnings")
@SecurityRequirement(name = "bearerAuth")
public class WarningController {

    private static final Logger logger = LoggerFactory.getLogger(WarningController.class);
    private final WarningService warningService;
    private final MemberService memberService;

    @Autowired
    public WarningController(WarningService warningService, MemberService memberService) {
        this.warningService = warningService;
        this.memberService = memberService;
    }

    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Create a warning for a user",
            description = "Admins can warn users for violating community rules"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "201",
                    description = "Warning created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = WarningDto.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Invalid request",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Member not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            )
    })
    public ResponseEntity<?> createWarning(
            @Valid @RequestBody CreateWarningRequest request,
            Principal principal) {
        try {
            logger.info("Creating warning for member ID: {}", request.getMemberId());
            
            // Get the admin who is creating the warning
            Member admin = memberService.findByNameOrEmail(principal.getName(), principal.getName());
            
            // Create the warning
            WarningDto warningDto = warningService.createWarning(request, admin);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(warningDto);
        } catch (Exception e) {
            logger.error("Error creating warning", e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get all warnings",
            description = "Get a paginated list of all warnings in the system"
    )
    public ResponseEntity<?> getAllWarnings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            logger.info("Getting all warnings, page: {}, size: {}", page, size);
            
            Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? 
                    Sort.Direction.ASC : Sort.Direction.DESC;
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            Page<WarningDto> warnings = warningService.getAllWarnings(pageable);
            
            return ResponseEntity.ok(warnings);
        } catch (Exception e) {
            logger.error("Error getting warnings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping(value = "/member/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get warnings for a specific member",
            description = "Get a paginated list of warnings for a specific member"
    )
    public ResponseEntity<?> getWarningsForMember(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            logger.info("Getting warnings for member ID: {}", memberId);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<WarningDto> warnings = warningService.getWarningsForMember(memberId, pageable);
            
            return ResponseEntity.ok(warnings);
        } catch (Exception e) {
            logger.error("Error getting warnings for member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping(value = "/{warningId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Get warning by ID",
            description = "Get a specific warning by its ID"
    )
    public ResponseEntity<?> getWarningById(@PathVariable Long warningId) {
        try {
            logger.info("Getting warning by ID: {}", warningId);
            
            WarningDto warning = warningService.getWarningById(warningId);
            
            return ResponseEntity.ok(warning);
        } catch (Exception e) {
            logger.error("Error getting warning", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping(value = "/ban/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Ban a member",
            description = "Ban a member for violating community rules"
    )
    public ResponseEntity<?> banMember(
            @PathVariable Long memberId,
            @RequestParam String reason,
            Principal principal) {
        try {
            logger.info("Banning member ID: {}", memberId);
            
            // Get the admin who is banning the member
            Member admin = memberService.findByNameOrEmail(principal.getName(), principal.getName());
            
            // Ban the member
            Member bannedMember = warningService.banMember(memberId, reason, admin);
            
            return ResponseEntity.ok(new ApiResponse(true, "Member banned successfully"));
        } catch (Exception e) {
            logger.error("Error banning member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping(value = "/unban/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Unban a member",
            description = "Unban a previously banned member"
    )
    public ResponseEntity<?> unbanMember(@PathVariable Long memberId) {
        try {
            logger.info("Unbanning member ID: {}", memberId);
            
            // Unban the member
            Member unbannedMember = warningService.unbanMember(memberId);
            
            return ResponseEntity.ok(new ApiResponse(true, "Member unbanned successfully"));
        } catch (Exception e) {
            logger.error("Error unbanning member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
