package edu.cit.citforums.service;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.request.ForumRequest;
import edu.cit.citforums.models.Forum;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.repository.ForumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForumServiceImpl implements ForumService {

    private final ForumRepository forumRepository;
    private final MemberService memberService;

    @Autowired
    public ForumServiceImpl(ForumRepository forumRepository, MemberService memberService) {
        this.forumRepository = forumRepository;
        this.memberService = memberService;
    }

    @Override
    public ForumDto createForum(ForumRequest forumRequest, Long creatorId) {
        // Check if a forum with the same title already exists
        if (forumRepository.existsByTitle(forumRequest.getTitle())) {
            throw new RuntimeException("A forum with this title already exists");
        }
        
        // Get the creator
        Member creator = memberService.getMemberEntity(creatorId);
        
        // Create forum
        Forum forum = new Forum();
        forum.setTitle(forumRequest.getTitle());
        forum.setDescription(forumRequest.getDescription());
        forum.setActive(forumRequest.isActive());
        forum.setCreatedBy(creator);
        forum.setCreatedAt(LocalDateTime.now());
        
        // Save and return
        Forum savedForum = forumRepository.save(forum);
        return mapToDto(savedForum);
    }

    @Override
    public ForumDto updateForum(Long forumId, ForumRequest forumRequest) {
        Forum forum = getForumEntity(forumId);
        
        // Check if title is changing and if the new title already exists
        if (!forum.getTitle().equals(forumRequest.getTitle()) && 
            forumRepository.existsByTitle(forumRequest.getTitle())) {
            throw new RuntimeException("A forum with this title already exists");
        }
        
        // Update fields
        forum.setTitle(forumRequest.getTitle());
        forum.setDescription(forumRequest.getDescription());
        forum.setActive(forumRequest.isActive());
        forum.setUpdatedAt(LocalDateTime.now());
        
        // Save and return
        Forum updatedForum = forumRepository.save(forum);
        return mapToDto(updatedForum);
    }

    @Override
    public void deleteForum(Long forumId) {
        Forum forum = getForumEntity(forumId);
        forumRepository.delete(forum);
    }

    @Override
    public ForumDto getForum(Long forumId) {
        Forum forum = getForumEntity(forumId);
        return mapToDto(forum);
    }

    @Override
    public PagedResponseDto<ForumDto> getAllForums(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Forum> forumPage = forumRepository.findAll(pageable);
        
        List<ForumDto> forums = forumPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                forums,
                forumPage.getNumber(),
                forumPage.getSize(),
                forumPage.getTotalElements(),
                forumPage.getTotalPages(),
                forumPage.isLast()
        );
    }

    @Override
    public List<ForumDto> getAllActiveForums() {
        List<Forum> forums = forumRepository.findByActiveTrueOrderByCreatedAtDesc();
        return forums.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PagedResponseDto<ForumDto> searchForums(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Forum> forumPage = forumRepository.searchForums(query, pageable);
        
        List<ForumDto> forums = forumPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                forums,
                forumPage.getNumber(),
                forumPage.getSize(),
                forumPage.getTotalElements(),
                forumPage.getTotalPages(),
                forumPage.isLast()
        );
    }

    @Override
    public Forum getForumEntity(Long forumId) {
        return forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found with ID: " + forumId));
    }

    @Override
    public boolean isForumActive(Long forumId) {
        Forum forum = getForumEntity(forumId);
        return forum.isActive();
    }

    @Override
    public void toggleForumStatus(Long forumId) {
        Forum forum = getForumEntity(forumId);
        forum.setActive(!forum.isActive());
        forum.setUpdatedAt(LocalDateTime.now());
        forumRepository.save(forum);
    }
    
    // Helper method to map Forum entity to ForumDto
    private ForumDto mapToDto(Forum forum) {
        MemberSummaryDto creatorDto = null;
        if (forum.getCreatedBy() != null) {
            creatorDto = MemberSummaryDto.builder()
                    .id(forum.getCreatedBy().getId())
                    .name(forum.getCreatedBy().getName())
                    .build();
        }
        
        return ForumDto.builder()
                .id(forum.getId())
                .title(forum.getTitle())
                .description(forum.getDescription())
                .createdAt(forum.getCreatedAt())
                .updatedAt(forum.getUpdatedAt())
                .threadCount(forum.getThreads() != null ? forum.getThreads().size() : 0)
                .createdBy(creatorDto)
                .active(forum.isActive())
                .build();
    }
} 