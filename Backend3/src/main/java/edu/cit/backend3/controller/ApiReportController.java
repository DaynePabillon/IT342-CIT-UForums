package edu.cit.backend3.controller;

import edu.cit.backend3.models.Report;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.ReportRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.service.MemberService;
import edu.cit.backend3.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports/new")
@CrossOrigin(origins = {"http://localhost:3000", "https://it342-cit-uforums.onrender.com"})
@Tag(name = "Reports", description = "Operations for creating and managing reports")
@SecurityRequirement(name = "bearerAuth")
public class ApiReportController {

    private static final Logger logger = LoggerFactory.getLogger(ApiReportController.class);
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private MemberService memberService;
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Create a new report",
        description = "Submit a report for inappropriate content"
    )
    public ResponseEntity<?> createReport(
            @RequestBody Report reportRequest,
            Principal principal) {
        
        try {
            // Find the current user
            Member reporter = memberService.findByNameOrEmail(principal.getName(), principal.getName());
            if (reporter == null) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Reporter not found"));
            }
            
            // Create and save the report
            Report report = new Report();
            report.setReporter(reporter);
            report.setReason(reportRequest.getReason());
            report.setContentType(reportRequest.getContentType());
            report.setContentId(reportRequest.getContentId());
            report.setStatus("PENDING");
            report.setCreatedAt(LocalDateTime.now());
            
            Report savedReport = reportRepository.save(report);
            
            return ResponseEntity.ok(new ApiResponse(true, "Report submitted successfully", savedReport));
        } catch (Exception e) {
            logger.error("Error creating report", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Failed to submit report: " + e.getMessage()));
        }
    }
}
