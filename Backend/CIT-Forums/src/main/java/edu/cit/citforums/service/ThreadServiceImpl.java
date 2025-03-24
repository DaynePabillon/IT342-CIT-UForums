package edu.cit.citforums.service;

import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.ThreadDto;
import edu.cit.citforums.dto.request.ThreadRequest;
import edu.cit.citforums.models.Forum;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.models.Thread;
import edu.cit.citforums.repository.ForumRepository;
import edu.cit.citforums.repository.ThreadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThreadServiceImpl implements ThreadService {

    private final ThreadRepository threadRepository;
    private final ForumRepository forumRepository;
    private final MemberService memberService;
    private final PostService postService;

    @Autowired
    public ThreadServiceImpl(
            ThreadRepository threadRepository,
            ForumRepository forumRepository,
            MemberService memberService,
            PostService postService) {
        this.threadRepository = threadRepository;
        this.forumRepository = forumRepository;
        this.memberService = memberService;
        this.postService = postService;
    }

    @Override
    public ThreadDto createThread(ThreadRequest threadRequest, Long authorId) {
        // Get the forum
        Forum forum = forumRepository.findById(threadRequest.getForumId())
                .orElseThrow(() -> new RuntimeException("Forum not found with ID: " + threadRequest.getForumId()));
        
        // Get the author
        Member author = memberService.getMemberEntity(authorId);
        
        // Create thread
        Thread thread = new Thread();
        thread.setTitle(threadRequest.getTitle());
        thread.setContent(threadRequest.getContent());
        thread.setForum(forum);
        thread.setCreatedBy(author);
        thread.setPinned(threadRequest.isPinned());
        thread.setLocked(threadRequest.isLocked());
        thread.setCreatedAt(LocalDateTime.now());
        
        // Save and return
        Thread savedThread = threadRepository.save(thread);
        return mapToDto(savedThread);
    }

    @Override
    public ThreadDto updateThread(Long threadId, ThreadRequest threadRequest) {
        Thread thread = getThreadEntity(threadId);
        
        // Update fields
        thread.setTitle(threadRequest.getTitle());
        thread.setContent(threadRequest.getContent());
        thread.setPinned(threadRequest.isPinned());
        thread.setLocked(threadRequest.isLocked());
        thread.setUpdatedAt(LocalDateTime.now());
        
        // If the forum is changed, update it
        if (!thread.getForum().getId().equals(threadRequest.getForumId())) {
            Forum newForum = forumRepository.findById(threadRequest.getForumId())
                    .orElseThrow(() -> new RuntimeException("Forum not found with ID: " + threadRequest.getForumId()));
            thread.setForum(newForum);
        }
        
        // Save and return
        Thread updatedThread = threadRepository.save(thread);
        return mapToDto(updatedThread);
    }

    @Override
    public void deleteThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        threadRepository.delete(thread);
    }

    @Override
    public ThreadDto getThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        return mapToDto(thread);
    }

    @Override
    public PagedResponseDto<ThreadDto> getThreadsByForum(Long forumId, int page, int size) {
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found with ID: " + forumId));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Thread> threadPage = threadRepository.findByForumOrderByPinnedDescCreatedAtDesc(forum, pageable);
        
        List<ThreadDto> threads = threadPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                threads,
                threadPage.getNumber(),
                threadPage.getSize(),
                threadPage.getTotalElements(),
                threadPage.getTotalPages(),
                threadPage.isLast()
        );
    }

    @Override
    public PagedResponseDto<ThreadDto> getRecentThreads(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Thread> threadPage = threadRepository.findRecentThreads(pageable);
        
        List<ThreadDto> threads = threadPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                threads,
                threadPage.getNumber(),
                threadPage.getSize(),
                threadPage.getTotalElements(),
                threadPage.getTotalPages(),
                threadPage.isLast()
        );
    }

    @Override
    public List<ThreadDto> getRecentThreadsLimit(int limit) {
        // Using findTop5 as a default, but could be expanded for other limits in a more sophisticated implementation
        List<Thread> threads = threadRepository.findTop5ByOrderByCreatedAtDesc();
        return threads.stream()
                .map(this::mapToDto)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public PagedResponseDto<ThreadDto> searchThreads(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Thread> threadPage = threadRepository.searchThreads(query, pageable);
        
        List<ThreadDto> threads = threadPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                threads,
                threadPage.getNumber(),
                threadPage.getSize(),
                threadPage.getTotalElements(),
                threadPage.getTotalPages(),
                threadPage.isLast()
        );
    }

    @Override
    public Thread getThreadEntity(Long threadId) {
        return threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + threadId));
    }

    @Override
    @Transactional
    public void incrementThreadViewCount(Long threadId) {
        threadRepository.incrementViewCount(threadId);
    }

    @Override
    public void pinThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        thread.setPinned(true);
        threadRepository.save(thread);
    }

    @Override
    public void unpinThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        thread.setPinned(false);
        threadRepository.save(thread);
    }

    @Override
    public void lockThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        thread.setLocked(true);
        threadRepository.save(thread);
    }

    @Override
    public void unlockThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        thread.setLocked(false);
        threadRepository.save(thread);
    }
    
    // Helper method to map Thread entity to ThreadDto
    private ThreadDto mapToDto(Thread thread) {
        MemberSummaryDto authorDto = MemberSummaryDto.builder()
                .id(thread.getCreatedBy().getId())
                .name(thread.getCreatedBy().getName())
                .build();
        
        // Get post count for this thread
        long postCount = postService.countPostsByThread(thread.getId());
        
        return ThreadDto.builder()
                .id(thread.getId())
                .title(thread.getTitle())
                .content(thread.getContent())
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getUpdatedAt())
                .forumId(thread.getForum().getId())
                .forumTitle(thread.getForum().getTitle())
                .createdBy(authorDto)
                .postCount((int) postCount)
                .viewCount(thread.getViewCount())
                .pinned(thread.isPinned())
                .locked(thread.isLocked())
                .build();
    }
} 