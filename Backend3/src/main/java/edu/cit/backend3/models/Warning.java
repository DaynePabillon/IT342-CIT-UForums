package edu.cit.backend3.models;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "warnings")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Warning {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne
    @JoinColumn(name = "admin_id", nullable = false)
    private Member admin;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = true)
    private String contentType; // "thread", "comment", etc.

    @Column(nullable = true)
    private Long contentId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private boolean acknowledged = false;

    private LocalDateTime acknowledgedAt;
}
