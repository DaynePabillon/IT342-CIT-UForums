package edu.cit.backend3.service.impl;

import edu.cit.backend3.dto.ForumDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.ForumRequest;
import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.ForumCategory;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.ForumCategoryRepository;
import edu.cit.backend3.repository.ForumRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumServiceImpl implements ForumService {

    private final ForumRepository forumRepository;
    private final ForumCategoryRepository forumCategoryRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public ForumDto createForum(ForumRequest forumRequest, Long creatorId) {
        Member creator = memberRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        // Get the category by name
        List<ForumCategory> categories = forumCategoryRepository.findByName(forumRequest.getCategoryName());
        
        if (categories.isEmpty()) {
            throw new RuntimeException("Category not found: " + forumRequest.getCategoryName());
        }
        
        // Use the first category found (after cleanup, there should only be one)
        ForumCategory category = categories.get(0);

        // Check if a forum with the same title already exists
        if (forumRepository.existsByTitle(forumRequest.getTitle())) {
            throw new RuntimeException("A forum with this title already exists");
        }

        Forum forum = Forum.builder()
                .title(forumRequest.getTitle())
                .description(forumRequest.getDescription())
                .createdBy(creator)
                .category(category)
                .build();

        forum = forumRepository.save(forum);
        return convertToDto(forum);
    }

    @Override
    @Transactional
    public ForumDto updateForum(Long forumId, ForumRequest forumRequest) {
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found"));

        List<ForumCategory> categories = forumCategoryRepository.findByName(forumRequest.getCategoryName());
        
        if (categories.isEmpty()) {
            throw new RuntimeException("Category not found: " + forumRequest.getCategoryName());
        }
        
        ForumCategory category = categories.get(0);

        forum.setTitle(forumRequest.getTitle());
        forum.setDescription(forumRequest.getDescription());
        forum.setCategory(category);

        forum = forumRepository.save(forum);
        return convertToDto(forum);
    }

    @Override
    @Transactional
    public void deleteForum(Long forumId) {
        forumRepository.deleteById(forumId);
    }

    @Override
    @Transactional(readOnly = true)
    public ForumDto getForum(Long forumId) {
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found"));
        return convertToDto(forum);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ForumDto> getAllForums(int page, int size) {
        Page<Forum> forums = forumRepository.findAll(PageRequest.of(page, size));
        return forums.map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ForumDto> searchForums(String query, int page, int size) {
        Page<Forum> forums = forumRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                query, query, PageRequest.of(page, size));
        return forums.map(this::convertToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Forum getForumEntity(Long forumId) {
        return forumRepository.findById(forumId)
                .orElseThrow(() -> new RuntimeException("Forum not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ForumDto> getAllActiveForums() {
        return forumRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFirstForumByCategory(ForumCategory category) {
        if ("GENERAL".equals(category.getName())) {
            List<Forum> extraForums = forumRepository.findExtraGeneralForums();
            for (Forum forum : extraForums) {
                forum.getThreads().clear(); // Clear threads to avoid foreign key constraints
                forumRepository.delete(forum);
            }
        }
    }

    @Override
    public List<Forum> getForumsByCategory(ForumCategory category) {
        return forumRepository.findByCategory(category);
    }

    @Override
    public List<ForumDto> getForumsByCategoryDto(ForumCategory category) {
        return getForumsByCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ForumDto convertToDto(Forum forum) {
        return ForumDto.builder()
                .id(forum.getId())
                .title(forum.getTitle())
                .description(forum.getDescription())
                .createdAt(forum.getCreatedAt())
                .updatedAt(forum.getUpdatedAt())
                .threadCount(forum.getThreads() != null ? forum.getThreads().size() : 0)
                .createdBy(MemberSummaryDto.builder()
                        .id(forum.getCreatedBy().getId())
                        .name(forum.getCreatedBy().getName())
                        .build())
                .active(true)
                .categoryName(forum.getCategory().getName())
                .lastActivity(forum.getLastActivity())
                .build();
    }
} 