package edu.cit.citforums.repository;

import edu.cit.citforums.models.Post;
import edu.cit.citforums.models.Thread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Page<Post> findByThreadId(Long threadId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Post> searchPosts(String query, Pageable pageable);
    
    Long countByThreadId(Long threadId);
} 