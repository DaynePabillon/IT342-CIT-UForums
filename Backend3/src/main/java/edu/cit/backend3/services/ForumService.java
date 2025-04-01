package edu.cit.backend3.services;

import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.ForumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumRepository forumRepository;

    @Transactional(readOnly = true)
    public Page<Forum> getAllForums(Pageable pageable) {
        return forumRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Forum getForumById(Long id) {
        return forumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forum not found with id: " + id));
    }

    @Transactional
    public Forum createForum(Forum forum) {
        // Set the createdBy field to the current user
        forum.setCreatedBy((Member) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        return forumRepository.save(forum);
    }

    @Transactional
    public Forum updateForum(Long id, Forum forum) {
        Forum existingForum = getForumById(id);
        existingForum.setTitle(forum.getTitle());
        existingForum.setDescription(forum.getDescription());
        existingForum.setCategory(forum.getCategory());
        return forumRepository.save(existingForum);
    }

    @Transactional
    public void deleteForum(Long id) {
        forumRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<Forum> searchForums(String query, Pageable pageable) {
        return forumRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                query, query, pageable);
    }
} 