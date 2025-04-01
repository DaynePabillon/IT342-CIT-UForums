package edu.cit.backend3.repository;

import edu.cit.backend3.models.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByEmail(String email);
    
    Optional<Member> findByName(String name);
    
    Boolean existsByEmail(String email);
    
    Boolean existsByName(String name);

    Optional<Member> findByNameOrEmail(String name, String email);

    @Query(value = 
           "SELECT TO_CHAR(m.created_at, :dateFormat) as period, COUNT(m.id) as count " +
           "FROM members m " +
           "WHERE m.created_at BETWEEN :startDate AND :endDate " +
           "GROUP BY period " +
           "ORDER BY period", 
           nativeQuery = true)
    List<Object[]> countRegistrationsByPeriod(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            @Param("dateFormat") String dateFormat);
    
    @Query(value = 
           "SELECT period, COUNT(DISTINCT author_id) as count FROM (" +
           "  SELECT TO_CHAR(t.created_at, :dateFormat) as period, t.author_id " +
           "  FROM threads t " +
           "  WHERE t.created_at BETWEEN :startDate AND :endDate " +
           "  UNION " +
           "  SELECT TO_CHAR(c.created_at, :dateFormat) as period, c.author_id " +
           "  FROM comments c " +
           "  WHERE c.created_at BETWEEN :startDate AND :endDate" +
           ") activity " +
           "GROUP BY period " +
           "ORDER BY period", 
           nativeQuery = true)
    List<Object[]> countActiveUsersByPeriod(
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            @Param("dateFormat") String dateFormat);
} 