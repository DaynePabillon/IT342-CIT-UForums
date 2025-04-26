package edu.cit.backend3.service;

import edu.cit.backend3.dto.WarningDto;
import edu.cit.backend3.dto.IssueWarningRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Warning;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.WarningRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WarningServiceImpl implements WarningService {

    private static final Logger logger = LoggerFactory.getLogger(WarningServiceImpl.class);
    private static final int MAX_WARNINGS_BEFORE_BAN = 3;
    
    private final WarningRepository warningRepository;
    private final MemberRepository memberRepository;
    
    @Autowired
    public WarningServiceImpl(WarningRepository warningRepository, MemberRepository memberRepository) {
        this.warningRepository = warningRepository;
        this.memberRepository = memberRepository;
    }
    
    @Override
    @Transactional
    public WarningDto issueWarning(IssueWarningRequest request, Member admin) {
        logger.info("Issuing warning to member ID: {} by admin ID: {}", request.getMemberId(), admin.getId());
        
        Optional<Member> memberOpt = memberRepository.findById(request.getMemberId());
        if (!memberOpt.isPresent()) {
            logger.error("Member not found with ID: {}", request.getMemberId());
            throw new RuntimeException("Member not found");
        }
        
        Member member = memberOpt.get();
        
        // Create and save the warning
        Warning warning = new Warning();
        warning.setMember(member);
        warning.setAdmin(admin);
        warning.setReason(request.getReason());
        warning.setContentType(request.getContentType());
        warning.setContentId(request.getContentId());
        warning.setCreatedAt(LocalDateTime.now());
        warning.setAcknowledged(false);
        
        Warning savedWarning = warningRepository.save(warning);
        logger.info("Warning saved with ID: {}", savedWarning.getId());
        
        // Increment the member's warning count
        member.setWarningCount(member.getWarningCount() + 1);
        memberRepository.save(member);
        logger.info("Member warning count updated to: {}", member.getWarningCount());
        
        // Check if the member should be banned
        banMemberIfNeeded(member);
        
        return WarningDto.fromEntity(savedWarning);
    }
    
    @Override
    public WarningDto getWarningById(Long id) {
        Optional<Warning> warningOpt = warningRepository.findById(id);
        if (!warningOpt.isPresent()) {
            logger.error("Warning not found with ID: {}", id);
            throw new RuntimeException("Warning not found");
        }
        
        return WarningDto.fromEntity(warningOpt.get());
    }
    
    @Override
    public List<WarningDto> getWarningsForMember(Long memberId) {
        Optional<Member> memberOpt = memberRepository.findById(memberId);
        if (!memberOpt.isPresent()) {
            logger.error("Member not found with ID: {}", memberId);
            throw new RuntimeException("Member not found");
        }
        
        List<Warning> warnings = warningRepository.findByMemberOrderByCreatedAtDesc(memberOpt.get());
        return warnings.stream()
                .map(WarningDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<WarningDto> getAllWarnings() {
        List<Warning> warnings = warningRepository.findAll();
        return warnings.stream()
                .map(WarningDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public WarningDto acknowledgeWarning(Long warningId, Member member) {
        Optional<Warning> warningOpt = warningRepository.findById(warningId);
        if (!warningOpt.isPresent()) {
            logger.error("Warning not found with ID: {}", warningId);
            throw new RuntimeException("Warning not found");
        }
        
        Warning warning = warningOpt.get();
        
        // Verify the warning belongs to the member
        if (!warning.getMember().getId().equals(member.getId())) {
            logger.error("Warning ID: {} does not belong to member ID: {}", warningId, member.getId());
            throw new RuntimeException("Warning does not belong to this member");
        }
        
        // Acknowledge the warning
        warning.setAcknowledged(true);
        warning.setAcknowledgedAt(LocalDateTime.now());
        Warning savedWarning = warningRepository.save(warning);
        
        logger.info("Warning ID: {} acknowledged by member ID: {}", warningId, member.getId());
        
        return WarningDto.fromEntity(savedWarning);
    }
    
    @Override
    @Transactional
    public boolean banMemberIfNeeded(Member member) {
        if (member.getWarningCount() >= MAX_WARNINGS_BEFORE_BAN && !member.isBanned()) {
            // Ban the member
            member.setBanned(true);
            member.setBanReason("Received " + member.getWarningCount() + " warnings");
            member.setBannedUntil(LocalDateTime.now().plusDays(30)); // Ban for 30 days
            memberRepository.save(member);
            
            logger.info("Member ID: {} has been banned after receiving {} warnings", 
                    member.getId(), member.getWarningCount());
            return true;
        }
        return false;
    }
}
