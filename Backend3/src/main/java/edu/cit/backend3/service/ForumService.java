package edu.cit.backend3.service;

import edu.cit.backend3.dto.ForumDto;
import edu.cit.backend3.dto.request.ForumRequest;
import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.ForumCategory;
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
    List<ForumDto> getAllActiveForums();
    void deleteFirstForumByCategory(ForumCategory category);
    List<Forum> getForumsByCategory(ForumCategory category);
    List<ForumDto> getForumsByCategoryDto(ForumCategory category);
} 