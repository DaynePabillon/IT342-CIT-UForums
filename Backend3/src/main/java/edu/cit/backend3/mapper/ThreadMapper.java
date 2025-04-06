package edu.cit.backend3.mapper;

import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.models.Thread;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ThreadMapper {
    
    @Autowired
    private MemberMapper memberMapper;
    
    public ThreadDto toDto(Thread thread) {
        if (thread == null) {
            return null;
        }
        
        ThreadDto dto = new ThreadDto();
        dto.setId(thread.getId());
        dto.setTitle(thread.getTitle());
        dto.setContent(thread.getContent());
        dto.setCreatedAt(thread.getCreatedAt());
        dto.setUpdatedAt(thread.getUpdatedAt());
        dto.setLastActivity(thread.getLastActivity());
        dto.setViewCount(thread.getViewCount());
        dto.setPinned(thread.isPinned());
        dto.setLocked(thread.isLocked());
        
        if (thread.getAuthor() != null) {
            dto.setAuthorId(thread.getAuthor().getId());
            dto.setAuthorName(thread.getAuthor().getName());
        }
        
        if (thread.getForum() != null) {
            dto.setForumId(thread.getForum().getId());
            dto.setForumTitle(thread.getForum().getTitle());
        }
        
        if (thread.getCreatedBy() != null) {
            MemberSummaryDto createdBy = new MemberSummaryDto();
            createdBy.setId(thread.getCreatedBy().getId());
            createdBy.setName(thread.getCreatedBy().getName());
            createdBy.setEmail(thread.getCreatedBy().getEmail());
            createdBy.setFirstName(thread.getCreatedBy().getFirstName());
            createdBy.setLastName(thread.getCreatedBy().getLastName());
            dto.setCreatedBy(createdBy);
        }
        
        return dto;
    }
    
    public Thread toEntity(ThreadDto dto) {
        if (dto == null) {
            return null;
        }
        
        Thread thread = new Thread();
        thread.setId(dto.getId());
        thread.setTitle(dto.getTitle());
        thread.setContent(dto.getContent());
        thread.setCreatedAt(dto.getCreatedAt());
        thread.setUpdatedAt(dto.getUpdatedAt());
        thread.setLastActivity(dto.getLastActivity());
        thread.setViewCount(dto.getViewCount());
        thread.setPinned(dto.isPinned());
        thread.setLocked(dto.isLocked());
        
        return thread;
    }
} 