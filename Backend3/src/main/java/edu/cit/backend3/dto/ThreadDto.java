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
public class ThreadDto {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private Long forumId;
    private String forumTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastActivity;
    private int viewCount;
    private boolean pinned;
    private boolean locked;
    private int commentCount;
    private MemberSummaryDto createdBy;
} 