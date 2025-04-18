package edu.cit.backend3.repository;

import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.Thread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface ThreadRepository extends JpaRepository<Thread, Long> {
    
    Page<Thread> findByForumOrderByPinnedDescCreatedAtDesc(Forum forum, Pageable pageable);
    
    Page<Thread> findByForumId(Long forumId, Pageable pageable);
    
    Page<Thread> findByAuthorId(Long authorId, Pageable pageable);
    
    // Find recent threads
    List<Thread> findTop5ByOrderByCreatedAtDesc();
    
    @Query("SELECT t FROM Thread t ORDER BY t.createdAt DESC")
    Page<Thread> findRecentThreads(Pageable pageable);
    
    @Query("SELECT t FROM Thread t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Thread> searchThreads(String query, Pageable pageable);
    
    @Modifying
    @Query("UPDATE Thread t SET t.viewCount = t.viewCount + 1 WHERE t.id = :threadId")
    void incrementViewCount(Long threadId);

    Long countByForumId(Long forumId);
    
    Long countByAuthorId(Long authorId);
    
    @Query(value = 
           "SELECT TO_CHAR(t.created_at, :dateFormat) as period, COUNT(t.id) as count " +
           "FROM threads t " +
           "WHERE t.created_at BETWEEN :startDate AND :endDate " +
           "GROUP BY period " +
           "ORDER BY period", 
           nativeQuery = true)
    List<Object[]> countThreadsByPeriod(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            @Param("dateFormat") String dateFormat);
    
    // Count threads created per day for the last n days
    @Query(value = "SELECT CAST(created_at AS DATE) as date, COUNT(*) as count " +
            "FROM threads " +
            "WHERE created_at >= CURRENT_DATE - ?1 " +
            "GROUP BY CAST(created_at AS DATE) " +
            "ORDER BY date ASC", nativeQuery = true)
    List<Map<String, Object>> countThreadsByDay(int days);
} 