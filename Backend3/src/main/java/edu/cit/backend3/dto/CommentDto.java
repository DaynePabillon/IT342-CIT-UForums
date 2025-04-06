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
public class CommentDto {
    private Long id;
    private String content;
    private Long authorId;
    private String authorName;
    private MemberSummaryDto author;
    private Long threadId;
    private String threadTitle;
    private Long parentPostId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean edited;
} 