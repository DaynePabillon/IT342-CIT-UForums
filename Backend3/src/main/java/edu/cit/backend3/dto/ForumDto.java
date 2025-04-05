package edu.cit.backend3.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumDto {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int threadCount;
    private MemberSummaryDto createdBy;
    private boolean active;
    private String categoryName;
    private LocalDateTime lastActivity;
} 