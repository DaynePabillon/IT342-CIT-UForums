package edu.cit.backend3.service;

import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.request.ThreadRequest;
import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Thread;
import edu.cit.backend3.repository.ThreadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ThreadServiceImpl implements ThreadService {

    private static final Logger logger = LoggerFactory.getLogger(ThreadServiceImpl.class);
    private final ThreadRepository threadRepository;
    private final ForumService forumService;
    private final MemberService memberService;

    @Autowired
    public ThreadServiceImpl(ThreadRepository threadRepository, ForumService forumService, MemberService memberService) {
        this.threadRepository = threadRepository;
        this.forumService = forumService;
        this.memberService = memberService;
    }

    @Override
    @Transactional
    public ThreadDto createThread(ThreadRequest threadRequest, Long forumId, Long creatorId) {
        logger.info("Creating thread with request: {}", threadRequest);
        
        Forum forum = forumService.getForumEntity(forumId);
        Member creator = memberService.getMemberEntity(creatorId);
        
        Thread thread = new Thread();
        thread.setTitle(threadRequest.getTitle());
        thread.setContent(threadRequest.getContent());
        thread.setForum(forum);
        thread.setCreatedBy(creator);
        thread.setAuthor(creator);
        thread.setLastActivity(thread.getCreatedAt());
        
        Thread savedThread = threadRepository.save(thread);
        logger.info("Thread saved successfully with ID: {}", savedThread.getId());
        
        return mapToDto(savedThread);
    }

    @Override
    @Transactional
    public ThreadDto updateThread(Long threadId, ThreadRequest threadRequest) {
        Thread thread = getThreadEntity(threadId);
        
        thread.setTitle(threadRequest.getTitle());
        thread.setContent(threadRequest.getContent());
        thread.setUpdatedAt(LocalDateTime.now());
        
        return mapToDto(threadRepository.save(thread));
    }

    @Override
    @Transactional
    public void deleteThread(Long threadId) {
        Thread thread = getThreadEntity(threadId);
        threadRepository.delete(thread);
    }

    @Override
    public ThreadDto getThread(Long threadId) {
        return mapToDto(getThreadEntity(threadId));
    }

    @Override
    public Page<ThreadDto> getThreadsByForum(Long forumId, int page, int size) {
        logger.info("Fetching threads for forum ID: {} - page: {}, size: {}", forumId, page, size);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Thread> threadPage = threadRepository.findByForumId(forumId, pageRequest);
        
        logger.info("Found {} threads out of {} total", threadPage.getContent().size(), threadPage.getTotalElements());
        
        return threadPage.map(this::mapToDto);
    }

    @Override
    public Page<ThreadDto> searchThreads(String query, int page, int size) {
        logger.info("Searching threads with query: '{}' - page: {}, size: {}", query, page, size);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Thread> threadPage = threadRepository.searchThreads(query, pageRequest);
        
        logger.info("Found {} threads matching query out of {} total", threadPage.getContent().size(), threadPage.getTotalElements());
        
        return threadPage.map(this::mapToDto);
    }

    @Override
    public Thread getThreadEntity(Long threadId) {
        return threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + threadId));
    }

    private ThreadDto mapToDto(Thread thread) {
        MemberSummaryDto creatorDto = null;
        if (thread.getCreatedBy() != null) {
            creatorDto = MemberSummaryDto.builder()
                    .id(thread.getCreatedBy().getId())
                    .name(thread.getCreatedBy().getName())
                    .build();
        }
        
        return ThreadDto.builder()
                .id(thread.getId())
                .title(thread.getTitle())
                .content(thread.getContent())
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getUpdatedAt())
                .forumId(thread.getForum().getId())
                .createdBy(creatorDto)
                .lastActivity(thread.getLastActivity())
                .build();
    }
} 