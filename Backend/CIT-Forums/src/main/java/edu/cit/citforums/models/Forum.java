package edu.cit.citforums.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Forum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "forum", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Thread> threads = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private Member createdBy;
    
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;
    
    @Column
    private LocalDateTime lastActivity;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActivity = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 