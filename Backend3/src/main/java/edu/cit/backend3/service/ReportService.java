package edu.cit.backend3.service;

import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Report;
import edu.cit.backend3.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {
    @Autowired
    private ReportRepository reportRepository;

    public Report createReport(Report report) {
        report.setStatus("PENDING");
        return reportRepository.save(report);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status);
    }

    public List<Report> getReportsByReporter(Member reporter) {
        return reportRepository.findByReporter(reporter);
    }

    // New method that doesn't require a resolver
    public Report resolveReport(Long reportId, String action) {
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isPresent()) {
            Report report = optionalReport.get();
            report.setResolver(null); // Explicitly set resolver to null
            report.setStatus("RESOLVED");
            report.setAction(action);
            report.setResolvedAt(LocalDateTime.now());
            return reportRepository.save(report);
        }
        throw new RuntimeException("Report not found with id: " + reportId);
    }
    
    // Keep the original method for backward compatibility
    public Report resolveReport(Long reportId, Member resolver, String action) {
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isPresent()) {
            Report report = optionalReport.get();
            
            // Only set resolver if it's valid (not null and has a valid ID)
            if (resolver != null && resolver.getId() != null) {
                report.setResolver(resolver);
            } else {
                report.setResolver(null); // Explicitly set resolver to null
            }
            
            report.setStatus("RESOLVED");
            report.setAction(action);
            report.setResolvedAt(LocalDateTime.now());
            return reportRepository.save(report);
        }
        throw new RuntimeException("Report not found with id: " + reportId);
    }

    public List<Report> getReportsByContent(String contentType, Long contentId) {
        return reportRepository.findByContentTypeAndContentId(contentType, contentId);
    }

    public Report dismissReport(Long reportId) {
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isPresent()) {
            Report report = optionalReport.get();
            report.setResolver(null); // Explicitly set resolver to null
            report.setStatus("DISMISSED");
            report.setResolvedAt(LocalDateTime.now());
            return reportRepository.save(report);
        }
        throw new RuntimeException("Report not found with id: " + reportId);
    }
    
    // Keep the original method for backward compatibility
    public Report dismissReport(Long reportId, Member resolver) {
        Optional<Report> optionalReport = reportRepository.findById(reportId);
        if (optionalReport.isPresent()) {
            Report report = optionalReport.get();
            
            // Only set resolver if it's valid (not null and has a valid ID)
            if (resolver != null && resolver.getId() != null) {
                report.setResolver(resolver);
            } else {
                report.setResolver(null); // Explicitly set resolver to null
            }
            
            report.setStatus("DISMISSED");
            report.setResolvedAt(LocalDateTime.now());
            return reportRepository.save(report);
        }
        throw new RuntimeException("Report not found with id: " + reportId);
    }
}