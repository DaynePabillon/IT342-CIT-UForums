package edu.cit.backend3.repository;

import edu.cit.backend3.models.Report;
import edu.cit.backend3.models.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(String status);
    long countByStatus(String status);
    List<Report> findByReporter(Member reporter);
    List<Report> findByContentTypeAndContentId(String contentType, Long contentId);
    
    // Find recent reports
    List<Report> findTop5ByOrderByCreatedAtDesc();
}