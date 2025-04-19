package edu.cit.backend3.controllers;

import edu.cit.backend3.models.Report;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.service.ReportService;
import edu.cit.backend3.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Reports", description = "API for managing content reports")
public class ReportController {
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    @Autowired
    private ReportService reportService;

    @Autowired
    private MemberService memberService;

    @PostMapping
    @Operation(summary = "Create a new report", description = "Creates a new report for content that violates community guidelines")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Report created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Report.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> createReport(@RequestBody ReportRequest reportRequest, Authentication authentication) {
        // Validate required fields
        if (reportRequest.getReportedContentId() == null || reportRequest.getReportedContentType() == null || reportRequest.getReportedContentType().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Content ID and Content Type are required fields");
        }
        
        logger.info("Authentication name: {}", authentication.getName());
        
        Member reporter;
        try {
            reporter = memberService.findByNameOrEmail(authentication.getName(), authentication.getName());
        } catch (Exception e) {
            logger.error("Failed to find reporter: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User not found or not authenticated properly");
        }
        
        if (reporter == null) {
            logger.error("Reporter is null for user: {}", authentication.getName());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User not found");
        }
        
        logger.info("Found reporter: {}, ID: {}", reporter.getName(), reporter.getId());
        
        // Create a Report object from the request
        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(reportRequest.getReason());
        report.setContentType(reportRequest.getReportedContentType());
        report.setContentId(reportRequest.getReportedContentId());
        report.setStatus("PENDING");
        
        try {
            Report savedReport = reportService.createReport(report);
            return ResponseEntity.ok(savedReport);
        } catch (Exception e) {
            logger.error("Error creating report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating report: " + e.getMessage());
        }
    }

    @GetMapping
    @Operation(summary = "Get all reports", description = "Retrieves all reports in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reports retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getAllReports() {
        try {
            List<Report> reports = reportService.getAllReports();
            logger.info("Retrieved {} reports", reports.size());
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            logger.error("Error getting all reports: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error getting all reports: " + e.getMessage());
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get reports by status", description = "Retrieves reports filtered by their status (PENDING, RESOLVED, DISMISSED)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reports retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getReportsByStatus(
            @Parameter(description = "Status to filter by (PENDING, RESOLVED, DISMISSED)", required = true)
            @PathVariable String status) {
        try {
            return ResponseEntity.ok(reportService.getReportsByStatus(status));
        } catch (Exception e) {
            logger.error("Error getting reports by status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error getting reports by status: " + e.getMessage());
        }
    }

    @GetMapping("/my-reports")
    @Operation(summary = "Get current user's reports", description = "Retrieves all reports created by the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User's reports retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "User not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getMyReports(Authentication authentication) {
        Member reporter;
        try {
            reporter = memberService.findByNameOrEmail(authentication.getName(), authentication.getName());
            return ResponseEntity.ok(reportService.getReportsByReporter(reporter));
        } catch (Exception e) {
            logger.error("Failed to find reporter: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Failed to find user: " + e.getMessage());
        }
    }

    @PostMapping("/{reportId}/resolve")
    @Operation(summary = "Resolve a report", description = "Marks a report as resolved with the specified action")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Report resolved successfully"),
            @ApiResponse(responseCode = "404", description = "Report not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> resolveReport(
            @Parameter(description = "ID of the report to resolve", required = true)
            @PathVariable Long reportId,
            @Parameter(description = "Action taken to resolve the report", required = true)
            @RequestParam String action) {
        try {
            return ResponseEntity.ok(reportService.resolveReport(reportId, action));
        } catch (Exception e) {
            logger.error("Error resolving report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error resolving report: " + e.getMessage());
        }
    }

    @PostMapping("/{reportId}/dismiss")
    @Operation(summary = "Dismiss a report", description = "Marks a report as dismissed (no action needed)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Report dismissed successfully"),
            @ApiResponse(responseCode = "404", description = "Report not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> dismissReport(
            @Parameter(description = "ID of the report to dismiss", required = true)
            @PathVariable Long reportId) {
        try {
            return ResponseEntity.ok(reportService.dismissReport(reportId));
        } catch (Exception e) {
            logger.error("Error dismissing report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error dismissing report: " + e.getMessage());
        }
    }

    @GetMapping("/content/{contentType}/{contentId}")
    @Operation(summary = "Get reports by content", description = "Retrieves reports for the specified content")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reports retrieved successfully"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getReportsByContent(
            @Parameter(description = "Type of the content to filter by", required = true)
            @PathVariable String contentType,
            @Parameter(description = "ID of the content to filter by", required = true)
            @PathVariable Long contentId) {
        try {
            return ResponseEntity.ok(reportService.getReportsByContent(contentType, contentId));
        } catch (Exception e) {
            logger.error("Error getting reports by content: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error getting reports by content: " + e.getMessage());
        }
    }
    
    // Inner class to match frontend request format
    public static class ReportRequest {
        private String reportedContentType;
        private Long reportedContentId;
        private String reason;
        
        public String getReportedContentType() {
            return reportedContentType;
        }
        
        public void setReportedContentType(String reportedContentType) {
            this.reportedContentType = reportedContentType;
        }
        
        public Long getReportedContentId() {
            return reportedContentId;
        }
        
        public void setReportedContentId(Long reportedContentId) {
            this.reportedContentId = reportedContentId;
        }
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}