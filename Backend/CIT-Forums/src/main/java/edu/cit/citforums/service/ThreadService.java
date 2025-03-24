package edu.cit.citforums.service;

import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.dto.request.ThreadRequest;
import edu.cit.citforums.models.Thread;

import java.util.List;

public interface ThreadService {
    
    ThreadDto createThread(ThreadRequest threadRequest, Long authorId);
    
    ThreadDto updateThread(Long threadId, ThreadRequest threadRequest);
    
    void deleteThread(Long threadId);
    
    ThreadDto getThread(Long threadId);
    
    PagedResponseDto<ThreadDto> getThreadsByForum(Long forumId, int page, int size);
    
    PagedResponseDto<ThreadDto> getRecentThreads(int page, int size);
    
    List<ThreadDto> getRecentThreadsLimit(int limit);
    
    PagedResponseDto<ThreadDto> searchThreads(String query, int page, int size);
    
    Thread getThreadEntity(Long threadId);
    
    void incrementThreadViewCount(Long threadId);
    
    void pinThread(Long threadId);
    
    void unpinThread(Long threadId);
    
    void lockThread(Long threadId);
    
    void unlockThread(Long threadId);
} 