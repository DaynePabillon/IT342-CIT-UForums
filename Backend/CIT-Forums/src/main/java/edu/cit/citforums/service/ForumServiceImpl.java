package edu.cit.citforums.service;

import edu.cit.citforums.dto.ForumDto;
import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.request.ForumRequest;
import edu.cit.citforums.models.Forum;
import edu.cit.citforums.models.ForumCategory;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.repository.ForumRepository;
import edu.cit.citforums.service.MemberService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ForumServiceImpl implements ForumService {

    private static final Logger logger = LoggerFactory.getLogger(ForumServiceImpl.class);
    private final ForumRepository forumRepository;
    private final MemberService memberService;

    @Autowired
    public ForumServiceImpl(ForumRepository forumRepository, MemberService memberService) {
        this.forumRepository = forumRepository;
        this.memberService = memberService;
    }

    @Override
    @Transactional
    public ForumDto createForum(ForumRequest forumRequest, Long creatorId) {
        logger.info("Creating forum with request: {}", forumRequest);
        
        if (forumRepository.existsByTitle(forumRequest.getTitle())) {
            logger.warn("Forum with title '{}' already exists", forumRequest.getTitle());
            throw new RuntimeException("Forum with this title already exists");
        }
        
        Member creator = memberService.getMemberEntity(creatorId);
        logger.info("Found creator: {}", creator);
        
        Forum forum = new Forum();
        forum.setTitle(forumRequest.getTitle());
        forum.setDescription(forumRequest.getDescription());
        forum.setCategory(forumRequest.getCategory());
        forum.setCreatedBy(creator);
        forum.setLastActivity(forum.getCreatedAt());
        
        Forum savedForum = forumRepository.save(forum);
        logger.info("Forum saved successfully with ID: {}", savedForum.getId());
        
        ForumDto result = mapToDto(savedForum);
        logger.info("Mapped forum to DTO: {}", result);
        return result;
    }

    @Override
    @Transactional
    public ForumDto updateForum(Long forumId, ForumRequest forumRequest) {
        Forum forum = getForumEntity(forumId);
        
        if (!forum.getTitle().equals(forumRequest.getTitle()) && 
            forumRepository.existsByTitle(forumRequest.getTitle())) {
            throw new RuntimeException("Forum with this title already exists");
        }
        
        forum.setTitle(forumRequest.getTitle());
        forum.setDescription(forumRequest.getDescription());
        forum.setCategory(forumRequest.getCategory());
        forum.setUpdatedAt(LocalDateTime.now());
        
        Forum updatedForum = forumRepository.save(forum);
        return mapToDto(updatedForum);
    }

    @Override
    @Transactional
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
    public Page<ForumDto> getAllForums(int page, int size) {
        logger.info("Fetching all forums - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Forum> forumPage = forumRepository.findAll(pageable);
        
        logger.info("Found {} forums out of {} total", forumPage.getContent().size(), forumPage.getTotalElements());
        
        return forumPage.map(this::mapToDto);
    }

    @Override
    public Page<ForumDto> searchForums(String query, int page, int size) {
        logger.info("Searching forums with query: '{}' - page: {}, size: {}", query, page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Forum> forumPage = forumRepository.searchForums(query, pageable);
        
        logger.info("Found {} forums matching query out of {} total", forumPage.getContent().size(), forumPage.getTotalElements());
        
        return forumPage.map(this::mapToDto);
    }

    @Override
    public Forum getForumEntity(Long forumId) {
        return forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found with ID: " + forumId));
    }
    
    @Override
    public List<ForumDto> getAllActiveForums() {
        logger.info("Fetching all active forums");
        List<Forum> forums = forumRepository.findAllByOrderByCreatedAtDesc();
        logger.info("Found {} active forums", forums.size());
        return forums.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteFirstForumByCategory(ForumCategory category) {
        logger.info("Deleting first forum with category: {}", category);
        List<Forum> forums = forumRepository.findByCategoryOrderByCreatedAtAsc(category);
        if (!forums.isEmpty()) {
            Forum firstForum = forums.get(0);
            logger.info("Found forum to delete: {}", firstForum.getTitle());
            forumRepository.delete(firstForum);
            logger.info("Successfully deleted forum: {}", firstForum.getTitle());
        } else {
            logger.warn("No forums found with category: {}", category);
        }
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
                .category(forum.getCategory())
                .createdAt(forum.getCreatedAt())
                .updatedAt(forum.getUpdatedAt())
                .createdBy(creatorDto)
                .lastActivity(forum.getLastActivity())
                .build();
    }
} 