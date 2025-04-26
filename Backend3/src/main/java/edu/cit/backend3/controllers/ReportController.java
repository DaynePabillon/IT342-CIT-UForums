package edu.cit.backend3.controllers;

import edu.cit.backend3.models.Report;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.service.ReportService;
import edu.cit.backend3.service.MemberService;
import edu.cit.backend3.dto.ReportDto;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:3000", "https://it342-cit-uforums.onrender.com", "https://it342-cit-uforums-site.onrender.com"})
@Tag(name = "Reports", description = "API for managing content reports")
public class ReportController {
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    @Autowired
    private ReportService reportService;

    @Autowired
    private MemberService memberService;

    // Define a static inner class for the report request
    public static class ReportRequest {
        private String reason;
        private String reportedContentType;
        private Long reportedContentId;
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        
        public String getReportedContentType() { return reportedContentType; }
        public void setReportedContentType(String reportedContentType) { this.reportedContentType = reportedContentType; }
        
        public Long getReportedContentId() { return reportedContentId; }
        public void setReportedContentId(Long reportedContentId) { this.reportedContentId = reportedContentId; }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new report", description = "Creates a new report for content that violates community guidelines")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Report created successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReportDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> createReport(@RequestBody ReportRequest reportRequest, Authentication authentication) {
        // Validate required fields
        if (reportRequest.getReportedContentId() == null || reportRequest.getReportedContentType() == null || reportRequest.getReportedContentType().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Content ID and Content Type are required fields");
        }
        
        try {
            logger.info("Creating report for {} with ID {}", reportRequest.getReportedContentType(), reportRequest.getReportedContentId());
            
            // Get the current user
            String username = authentication.getName();
            Member reporter = memberService.findByNameOrEmail(username, username);
            
            if (reporter == null) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User not found");
            }
            
            // Create the report
            Report report = new Report();
            report.setReporter(reporter);
            report.setReason(reportRequest.getReason());
            report.setContentType(reportRequest.getReportedContentType());
            report.setContentId(reportRequest.getReportedContentId());
            
            // Save the report
            Report savedReport = reportService.createReport(report);
            
            // Convert to DTO for response
            ReportDto reportDto = ReportDto.fromEntity(savedReport);
            
            return ResponseEntity.ok(reportDto);
        } catch (Exception e) {
            logger.error("Error creating report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while creating the report: " + e.getMessage());
        }
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get all reports", description = "Returns a list of all reports")
    public ResponseEntity<List<ReportDto>> getAllReports() {
        try {
            List<Report> reports = reportService.getAllReports();
            List<ReportDto> reportDtos = reports.stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(reportDtos);
        } catch (Exception e) {
            logger.error("Error fetching reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get report by ID", description = "Returns a report by its ID")
    public ResponseEntity<?> getReportById(@PathVariable Long id) {
        try {
            Report report = reportService.getReportById(id);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }
            ReportDto reportDto = ReportDto.fromEntity(report);
            return ResponseEntity.ok(reportDto);
        } catch (Exception e) {
            logger.error("Error fetching report with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get reports by status", description = "Returns a list of reports filtered by their status")
    public ResponseEntity<List<ReportDto>> getReportsByStatus(@PathVariable String status) {
        try {
            List<Report> reports = reportService.getReportsByStatus(status);
            List<ReportDto> reportDtos = reports.stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(reportDtos);
        } catch (Exception e) {
            logger.error("Error fetching reports by status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-reports")
    @Operation(summary = "Get current user's reports", description = "Returns a list of reports created by the authenticated user")
    public ResponseEntity<List<ReportDto>> getMyReports(Authentication authentication) {
        try {
            String username = authentication.getName();
            Member reporter = memberService.findByNameOrEmail(username, username);
            
            if (reporter == null) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User not found");
            }
            
            List<Report> reports = reportService.getReportsByReporter(reporter);
            List<ReportDto> reportDtos = reports.stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(reportDtos);
        } catch (Exception e) {
            logger.error("Error fetching user's reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}/resolve", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Resolve a report", description = "Marks a report as resolved")
    public ResponseEntity<?> resolveReport(
            @PathVariable Long id,
            @RequestParam(required = false) String action,
            Authentication authentication) {
        try {
            // Get the current user
            String username = authentication.getName();
            Member resolver = memberService.findByNameOrEmail(username, username);
            
            if (resolver == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User not found");
            }
            
            Report report = reportService.resolveReport(id, resolver, action);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }
            
            ReportDto reportDto = ReportDto.fromEntity(report);
            return ResponseEntity.ok(reportDto);
        } catch (Exception e) {
            logger.error("Error resolving report with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping(value = "/{id}/dismiss", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Dismiss a report", description = "Marks a report as dismissed")
    public ResponseEntity<?> dismissReport(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            // Get the current user
            String username = authentication.getName();
            Member resolver = memberService.findByNameOrEmail(username, username);
            
            if (resolver == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User not found");
            }
            
            Report report = reportService.dismissReport(id, resolver);
            if (report == null) {
                return ResponseEntity.notFound().build();
            }
            
            ReportDto reportDto = ReportDto.fromEntity(report);
            return ResponseEntity.ok(reportDto);
        } catch (Exception e) {
            logger.error("Error dismissing report with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/content/{contentType}/{contentId}")
    @Operation(summary = "Get reports by content", description = "Returns a list of reports for the specified content")
    public ResponseEntity<List<ReportDto>> getReportsByContent(
            @PathVariable String contentType,
            @PathVariable Long contentId) {
        try {
            List<Report> reports = reportService.getReportsByContent(contentType, contentId);
            List<ReportDto> reportDtos = reports.stream()
                .map(ReportDto::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(reportDtos);
        } catch (Exception e) {
            logger.error("Error fetching reports by content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}