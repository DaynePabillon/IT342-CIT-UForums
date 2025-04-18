package edu.cit.backend3.controllers;

import edu.cit.backend3.models.Report;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.service.ReportService;
import edu.cit.backend3.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Collections;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);
    
    @Autowired
    private ReportService reportService;

    @Autowired
    private MemberService memberService;

    @PostMapping
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

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReportsByStatus(@PathVariable String status) {
        try {
            return ResponseEntity.ok(reportService.getReportsByStatus(status));
        } catch (Exception e) {
            logger.error("Error getting reports by status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error getting reports by status: " + e.getMessage());
        }
    }

    @GetMapping("/my-reports")
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
    public ResponseEntity<?> resolveReport(
            @PathVariable Long reportId,
            @RequestParam String action,
            Authentication authentication) {
        try {
            Member resolver = memberService.findByNameOrEmail(authentication.getName(), authentication.getName());
            return ResponseEntity.ok(reportService.resolveReport(reportId, resolver, action));
        } catch (Exception e) {
            logger.error("Error resolving report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error resolving report: " + e.getMessage());
        }
    }

    @GetMapping("/content/{contentType}/{contentId}")
    public ResponseEntity<?> getReportsByContent(
            @PathVariable String contentType,
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