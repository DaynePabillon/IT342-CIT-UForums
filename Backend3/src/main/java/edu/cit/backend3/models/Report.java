package edu.cit.backend3.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String contentType; // "thread", "comment", etc.

    @Column(nullable = false)
    private Long contentId;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, RESOLVED, DISMISSED

    @ManyToOne
    @JoinColumn(name = "resolver_id")
    private Member resolver;

    private String action; // action taken to resolve the report

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    // Getter and setter for status with proper capitalization
    public void setStatus(String status) {
        this.status = status.toUpperCase();
    }
}