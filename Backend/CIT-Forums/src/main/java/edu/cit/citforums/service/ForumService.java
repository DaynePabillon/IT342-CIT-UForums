package edu.cit.citforums.service;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.request.ForumRequest;
import edu.cit.citforums.models.Forum;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ForumService {
    ForumDto createForum(ForumRequest forumRequest, Long creatorId);
    ForumDto updateForum(Long forumId, ForumRequest forumRequest);
    void deleteForum(Long forumId);
    ForumDto getForum(Long forumId);
    Page<ForumDto> getAllForums(int page, int size);
    Page<ForumDto> searchForums(String query, int page, int size);
    Forum getForumEntity(Long forumId);
} 