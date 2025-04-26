package edu.cit.backend3.service;

import edu.cit.backend3.dto.CreateWarningRequest;
import edu.cit.backend3.dto.WarningDto;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Warning;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.WarningRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class WarningServiceImpl implements WarningService {

    private static final Logger logger = LoggerFactory.getLogger(WarningServiceImpl.class);
    private final WarningRepository warningRepository;
    private final MemberRepository memberRepository;

    @Autowired
    public WarningServiceImpl(WarningRepository warningRepository, MemberRepository memberRepository) {
        this.warningRepository = warningRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    @Transactional
    public WarningDto createWarning(CreateWarningRequest request, Member warnedBy) {
        logger.info("Creating warning for member ID: {} by admin ID: {}", request.getMemberId(), warnedBy.getId());
        
        // Find the member to warn
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new EntityNotFoundException("Member not found with ID: " + request.getMemberId()));
        
        // Create the warning
        Warning warning = new Warning();
        warning.setMember(member);
        warning.setWarnedBy(warnedBy);
        warning.setReason(request.getReason());
        warning.setMessage(request.getMessage());
        warning.setCreatedAt(LocalDateTime.now());
        
        // Increment the warning count on the member
        member.setWarningCount(member.getWarningCount() + 1);
        
        // Check if this warning should trigger a ban (3 warnings)
        if (member.getWarningCount() >= 3 && !member.isBanned()) {
            member.setBanned(true);
            member.setBanReason("Automatically banned after receiving 3 warnings");
            member.setBannedAt(LocalDateTime.now());
            member.setBannedBy(warnedBy);
            logger.info("Member ID: {} has been automatically banned after 3 warnings", member.getId());
        }
        
        // Save the member and warning
        memberRepository.save(member);
        Warning savedWarning = warningRepository.save(warning);
        
        return WarningDto.fromEntity(savedWarning);
    }

    @Override
    public Page<WarningDto> getWarningsForMember(Long memberId, Pageable pageable) {
        logger.info("Getting warnings for member ID: {}", memberId);
        return warningRepository.findByMemberId(memberId, pageable)
                .map(WarningDto::fromEntity);
    }

    @Override
    public Page<WarningDto> getWarningsIssuedBy(Long adminId, Pageable pageable) {
        logger.info("Getting warnings issued by admin ID: {}", adminId);
        return warningRepository.findByWarnedById(adminId, pageable)
                .map(WarningDto::fromEntity);
    }

    @Override
    public Page<WarningDto> getAllWarnings(Pageable pageable) {
        logger.info("Getting all warnings");
        return warningRepository.findAll(pageable)
                .map(WarningDto::fromEntity);
    }

    @Override
    public WarningDto getWarningById(Long warningId) {
        logger.info("Getting warning by ID: {}", warningId);
        Warning warning = warningRepository.findById(warningId)
                .orElseThrow(() -> new EntityNotFoundException("Warning not found with ID: " + warningId));
        return WarningDto.fromEntity(warning);
    }

    @Override
    @Transactional
    public Member banMember(Long memberId, String reason, Member bannedBy) {
        logger.info("Banning member ID: {} by admin ID: {}", memberId, bannedBy.getId());
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found with ID: " + memberId));
        
        member.setBanned(true);
        member.setBanReason(reason);
        member.setBannedAt(LocalDateTime.now());
        member.setBannedBy(bannedBy);
        
        return memberRepository.save(member);
    }

    @Override
    @Transactional
    public Member unbanMember(Long memberId) {
        logger.info("Unbanning member ID: {}", memberId);
        
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found with ID: " + memberId));
        
        member.setBanned(false);
        member.setBanReason(null);
        member.setBannedAt(null);
        member.setBannedBy(null);
        
        return memberRepository.save(member);
    }
}
