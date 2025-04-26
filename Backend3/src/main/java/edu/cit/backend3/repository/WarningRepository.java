package edu.cit.backend3.repository;

import edu.cit.backend3.models.Warning;
import edu.cit.backend3.models.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarningRepository extends JpaRepository<Warning, Long> {
    List<Warning> findByMember(Member member);
    List<Warning> findByMemberOrderByCreatedAtDesc(Member member);
    int countByMemberAndAcknowledged(Member member, boolean acknowledged);
}
