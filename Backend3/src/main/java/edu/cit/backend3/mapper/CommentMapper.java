package edu.cit.backend3.mapper;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.models.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommentMapper {
    
    @Autowired
    private MemberMapper memberMapper;
    
    public CommentDto toDto(Comment comment) {
        if (comment == null) {
            return null;
        }
        
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setEdited(comment.getUpdatedAt() != null);
        
        if (comment.getAuthor() != null) {
            dto.setAuthorId(comment.getAuthor().getId());
            dto.setAuthorName(comment.getAuthor().getName());
            
            MemberSummaryDto authorSummary = new MemberSummaryDto();
            authorSummary.setId(comment.getAuthor().getId());
            authorSummary.setName(comment.getAuthor().getName());
            authorSummary.setEmail(comment.getAuthor().getEmail());
            authorSummary.setFirstName(comment.getAuthor().getFirstName());
            authorSummary.setLastName(comment.getAuthor().getLastName());
            dto.setAuthor(authorSummary);
        }
        
        if (comment.getThread() != null) {
            dto.setThreadId(comment.getThread().getId());
            dto.setThreadTitle(comment.getThread().getTitle());
            
            // Include the forum ID for proper navigation
            if (comment.getThread().getForum() != null) {
                dto.setForumId(comment.getThread().getForum().getId());
            }
        }

        if (comment.getParentPost() != null) {
            dto.setParentPostId(comment.getParentPost().getId());
        }
        
        return dto;
    }
    
    public Comment toEntity(CommentDto dto) {
        if (dto == null) {
            return null;
        }
        
        Comment comment = new Comment();
        comment.setId(dto.getId());
        comment.setContent(dto.getContent());
        comment.setCreatedAt(dto.getCreatedAt());
        comment.setUpdatedAt(dto.getUpdatedAt());
        
        return comment;
    }
} 