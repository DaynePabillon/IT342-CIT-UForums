package edu.cit.citforums.service;

import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.dto.request.ThreadRequest;
import edu.cit.citforums.models.Thread;
import org.springframework.data.domain.Page;

public interface ThreadService {
    ThreadDto createThread(ThreadRequest threadRequest, Long forumId, Long creatorId);
    ThreadDto updateThread(Long threadId, ThreadRequest threadRequest);
    void deleteThread(Long threadId);
    ThreadDto getThread(Long threadId);
    Page<ThreadDto> getThreadsByForum(Long forumId, int page, int size);
    Page<ThreadDto> searchThreads(String query, int page, int size);
    Thread getThreadEntity(Long threadId);
} 