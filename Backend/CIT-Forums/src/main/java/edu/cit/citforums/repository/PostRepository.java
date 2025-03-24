package edu.cit.citforums.repository;

import edu.cit.citforums.models.Member;
import edu.cit.citforums.models.Post;
import edu.cit.citforums.models.Thread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Page<Post> findByThreadOrderByCreatedAt(Thread thread, Pageable pageable);
    
    List<Post> findByThreadOrderByCreatedAt(Thread thread);
    
    List<Post> findByAuthorOrderByCreatedAtDesc(Member author);
    
    Page<Post> findByAuthorOrderByCreatedAtDesc(Member author, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Post> searchPosts(String query, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Post p WHERE p.thread.id = :threadId")
    long countByThreadId(Long threadId);
} 