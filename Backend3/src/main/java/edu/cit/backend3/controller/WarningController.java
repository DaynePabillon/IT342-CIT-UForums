package edu.cit.backend3.controller;

import edu.cit.backend3.dto.WarningDto;
import edu.cit.backend3.dto.IssueWarningRequest;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/warnings")
@CrossOrigin(origins = {"http://localhost:3000", "https://it342-cit-uforums.onrender.com", "https://it342-cit-uforums-site.onrender.com"})
@Tag(name = "Warnings", description = "API for managing user warnings")
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
    
    @PostMapping(value = "/issue", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Issue a warning to a user", description = "Admins can issue warnings to users for rule violations")
    public ResponseEntity<?> issueWarning(
            @Valid @RequestBody IssueWarningRequest request,
            Principal principal) {
        
        try {
            logger.info("Issuing warning to member ID: {}", request.getMemberId());
            
            // Find the admin issuing the warning
            Member admin = memberService.findByNameOrEmail(principal.getName(), principal.getName());
            if (admin == null) {
                logger.error("Admin not found: {}", principal.getName());
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Admin not found"));
            }
            
            // Issue the warning
            WarningDto warning = warningService.issueWarning(request, admin);
            
            logger.info("Warning issued successfully with ID: {}", warning.getId());
            return ResponseEntity.ok(warning);
        } catch (Exception e) {
            logger.error("Error issuing warning", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to issue warning: " + e.getMessage()));
        }
    }
    
    @GetMapping(value = "/member/{memberId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or @securityService.isSameUser(#memberId, principal)")
    @Operation(summary = "Get warnings for a member", description = "Get all warnings for a specific member")
    public ResponseEntity<?> getWarningsForMember(@PathVariable Long memberId) {
        try {
            logger.info("Getting warnings for member ID: {}", memberId);
            List<WarningDto> warnings = warningService.getWarningsForMember(memberId);
            return ResponseEntity.ok(warnings);
        } catch (Exception e) {
            logger.error("Error getting warnings for member ID: {}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get warnings: " + e.getMessage()));
        }
    }
    
    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all warnings", description = "Admins can view all warnings in the system")
    public ResponseEntity<?> getAllWarnings() {
        try {
            logger.info("Getting all warnings");
            List<WarningDto> warnings = warningService.getAllWarnings();
            return ResponseEntity.ok(warnings);
        } catch (Exception e) {
            logger.error("Error getting all warnings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to get warnings: " + e.getMessage()));
        }
    }
    
    @PutMapping(value = "/{warningId}/acknowledge", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Acknowledge a warning", description = "Users can acknowledge that they have read a warning")
    public ResponseEntity<?> acknowledgeWarning(
            @PathVariable Long warningId,
            Principal principal) {
        
        try {
            logger.info("Acknowledging warning ID: {} by user: {}", warningId, principal.getName());
            
            // Find the member acknowledging the warning
            Member member = memberService.findByNameOrEmail(principal.getName(), principal.getName());
            if (member == null) {
                logger.error("Member not found: {}", principal.getName());
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Member not found"));
            }
            
            // Acknowledge the warning
            WarningDto warning = warningService.acknowledgeWarning(warningId, member);
            
            logger.info("Warning ID: {} acknowledged successfully", warningId);
            return ResponseEntity.ok(warning);
        } catch (Exception e) {
            logger.error("Error acknowledging warning ID: {}", warningId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to acknowledge warning: " + e.getMessage()));
        }
    }
}
