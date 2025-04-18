package edu.cit.backend3.repository;

import edu.cit.backend3.models.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    Optional<Member> findByEmail(String email);
    
    Optional<Member> findByName(String name);
    
    Boolean existsByEmail(String email);
    
    Boolean existsByName(String name);

    @Query("SELECT m FROM Member m WHERE (:name IS NULL OR m.name = :name) OR (:email IS NULL OR m.email = :email)")
    List<Member> findByNameOrEmail(@Param("name") String name, @Param("email") String email);

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

    // Count users by role
    // @Query("SELECT COUNT(m) FROM Member m JOIN m.roles r WHERE r.name = :roleName")
    // long countByRole(@Param("roleName") String roleName);
    
    // Count users by status
    // @Query("SELECT COUNT(m) FROM Member m WHERE m.status = :status")
    // long countByStatus(@Param("status") String status);

    // Count users registered by month
    // @Query(value = "SELECT MONTH(created_at) as month, YEAR(created_at) as year, COUNT(*) as count " +
    //         "FROM members " +
    //         "GROUP BY YEAR(created_at), MONTH(created_at) " +
    //         "ORDER BY year DESC, month DESC LIMIT 12", nativeQuery = true)
    // List<Map<String, Object>> countUsersByMonth();

    // Find recent users
    List<Member> findTop5ByOrderByCreatedAtDesc();
} 