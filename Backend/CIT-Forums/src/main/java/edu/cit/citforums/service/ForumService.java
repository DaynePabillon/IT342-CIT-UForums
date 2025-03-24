package edu.cit.citforums.service;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.request.ForumRequest;
import edu.cit.citforums.models.Forum;

import java.util.List;

public interface ForumService {
    
    ForumDto createForum(ForumRequest forumRequest, Long creatorId);
    
    ForumDto updateForum(Long forumId, ForumRequest forumRequest);
    
    void deleteForum(Long forumId);
    
    ForumDto getForum(Long forumId);
    
    PagedResponseDto<ForumDto> getAllForums(int page, int size);
    
    List<ForumDto> getAllActiveForums();
    
    PagedResponseDto<ForumDto> searchForums(String query, int page, int size);
    
    Forum getForumEntity(Long forumId);
    
    boolean isForumActive(Long forumId);
    
    void toggleForumStatus(Long forumId);
} 