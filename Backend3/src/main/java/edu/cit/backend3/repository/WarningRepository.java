package edu.cit.backend3.repository;

import edu.cit.backend3.models.Warning;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WarningRepository extends JpaRepository<Warning, Long> {
    Page<Warning> findByMemberId(Long memberId, Pageable pageable);
    Page<Warning> findByWarnedById(Long warnedById, Pageable pageable);
    long countByMemberId(Long memberId);
}
