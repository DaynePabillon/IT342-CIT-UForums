package edu.cit.citforums.dto;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long forumId;
    private String forumTitle;
    private MemberSummaryDto createdBy;
    private int postCount;
    private int viewCount;
    private boolean pinned;
    private boolean locked;
} 