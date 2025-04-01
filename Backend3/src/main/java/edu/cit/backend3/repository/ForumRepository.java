package edu.cit.backend3.repository;

import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.ForumCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ForumRepository extends JpaRepository<Forum, Long> {
    
    Optional<Forum> findByTitle(String title);
    
    Boolean existsByTitle(String title);
    
    List<Forum> findAllByOrderByCreatedAtDesc();
    
    List<Forum> findByCategoryOrderByCreatedAtAsc(ForumCategory category);
    
    Page<Forum> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description, Pageable pageable);
    
    @Query("SELECT f FROM Forum f WHERE LOWER(f.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Forum> searchForums(String query, Pageable pageable);

    @Query("SELECT f FROM Forum f WHERE f.lastActivity < :thresholdDate OR f.lastActivity IS NULL")
    List<Forum> findForumsWithNoActivitySince(@Param("thresholdDate") LocalDateTime thresholdDate);
} 