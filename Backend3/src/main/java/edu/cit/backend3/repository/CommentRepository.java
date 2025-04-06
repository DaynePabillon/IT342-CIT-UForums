package edu.cit.backend3.repository;

import edu.cit.backend3.models.Comment;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByParentPostOrderByCreatedAt(Post post);
    
    Page<Comment> findByParentPostOrderByCreatedAt(Post post, Pageable pageable);
    
    List<Comment> findByAuthorOrderByCreatedAtDesc(Member author);
    
    Page<Comment> findByAuthorOrderByCreatedAtDesc(Member author, Pageable pageable);

    Long countByAuthorId(Long authorId);
    
    @Query("SELECT COUNT(c) FROM Comment c JOIN c.thread t WHERE t.forum.id = :forumId")
    Long countByForumId(Long forumId);
    
    @Query(value = 
           "SELECT TO_CHAR(c.created_at, :dateFormat) as period, COUNT(c.id) as count " +
           "FROM comments c " +
           "WHERE c.created_at BETWEEN :startDate AND :endDate " +
           "GROUP BY period " +
           "ORDER BY period", 
           nativeQuery = true)
    List<Object[]> countCommentsByPeriod(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            @Param("dateFormat") String dateFormat);

    Page<Comment> findByParentPost(Post post, Pageable pageable);
    Page<Comment> findByAuthorId(Long authorId, Pageable pageable);
} 