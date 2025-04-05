package edu.cit.backend3.service.impl;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemberServiceImpl implements MemberService {

    private static final Logger logger = LoggerFactory.getLogger(MemberServiceImpl.class);

    @Autowired
    private MemberRepository memberRepository;

    /**
     * Registers a new member with the provided registration details.
     * WARNING: This implementation stores passwords in plaintext, which is NOT secure
     * and should NOT be used in production environments. This is only for development/testing.
     */
    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public MemberDto registerMember(MemberRegistrationRequest registrationRequest) {
        logger.info("Starting member registration process");
        logger.info("Registration request: name={}, email={}", registrationRequest.getName(), registrationRequest.getEmail());
        
        try {
            // Check for existing username or email within the transaction
            if (existsByName(registrationRequest.getName())) {
                logger.error("Username already exists: {}", registrationRequest.getName());
                throw new RuntimeException("Username is already taken!");
            }
            if (existsByEmail(registrationRequest.getEmail())) {
                logger.error("Email already exists: {}", registrationRequest.getEmail());
                throw new RuntimeException("Email is already in use!");
            }

            Member member = new Member();
            member.setName(registrationRequest.getName());
            member.setEmail(registrationRequest.getEmail());
            
            // Encode the password
            String rawPassword = registrationRequest.getPassword();
            logger.info("Storing password directly: {}", rawPassword);
            member.setPassword(rawPassword);
            
            member.setFirstName(registrationRequest.getFirstName());
            member.setLastName(registrationRequest.getLastName());
            member.setAdmin(false);

            logger.info("Saving member to database...");
            Member savedMember = memberRepository.save(member);
            logger.info("Member saved successfully with ID: {}", savedMember.getId());
            
            return convertToDto(savedMember);
        } catch (Exception e) {
            logger.error("Error during member registration: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public MemberDto getMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        return convertToDto(member);
    }

    @Override
    public MemberDto getMemberByName(String name) {
        Member member = memberRepository.findByName(name)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        return convertToDto(member);
    }

    @Override
    public MemberDto getMemberByEmail(String email) {
        Member member = memberRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        return convertToDto(member);
    }

    @Override
    public List<MemberDto> getAllMembers() {
        return memberRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Override
    public MemberDto updateMember(Long memberId, MemberRegistrationRequest updateRequest) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));

        if (!member.getName().equals(updateRequest.getName()) && existsByName(updateRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (!member.getEmail().equals(updateRequest.getEmail()) && existsByEmail(updateRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        member.setName(updateRequest.getName());
        member.setEmail(updateRequest.getEmail());
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            logger.info("Storing password directly: {}", updateRequest.getPassword());
            member.setPassword(updateRequest.getPassword());
        }
        member.setFirstName(updateRequest.getFirstName());
        member.setLastName(updateRequest.getLastName());

        Member updatedMember = memberRepository.save(member);
        return convertToDto(updatedMember);
    }

    @Override
    public void deleteMember(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new RuntimeException("Member not found");
        }
        memberRepository.deleteById(memberId);
    }

    @Override
    public Member getMemberEntity(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
    }

    @Override
    public MemberSummaryDto getMemberSummary(Long memberId) {
        Member member = getMemberEntity(memberId);
        MemberSummaryDto summary = new MemberSummaryDto();
        summary.setId(member.getId());
        summary.setName(member.getName());
        summary.setEmail(member.getEmail());
        summary.setFirstName(member.getFirstName());
        summary.setLastName(member.getLastName());
        return summary;
    }

    @Override
    public boolean existsByName(String name) {
        return memberRepository.existsByName(name);
    }

    @Override
    public boolean existsByEmail(String email) {
        return memberRepository.existsByEmail(email);
    }

    @Override
    public Member saveMember(Member member) {
        return memberRepository.save(member);
    }

    @Override
    public MemberDto getMemberByUsernameOrEmail(String usernameOrEmail) {
        List<Member> members = memberRepository.findByNameOrEmail(usernameOrEmail, usernameOrEmail);
        if (members.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        // Take the first member if multiple exist
        Member member = members.get(0);
        logger.warn("Multiple users found for username/email: {}. Using first one with ID: {}", 
            usernameOrEmail, member.getId());
        return convertToDto(member);
    }

    @Override
    public Member findByNameOrEmail(String name, String email) {
        logger.info("Finding member by name: {} or email: {}", name, email);
        List<Member> members = memberRepository.findByNameOrEmail(name, email);
        if (members.isEmpty()) {
            logger.error("Member not found for name: {} or email: {}", name, email);
            throw new RuntimeException("Member not found");
        }
        // Take the first member if multiple exist
        Member member = members.get(0);
        if (members.size() > 1) {
            logger.warn("Multiple users found for name/email: {}/{}. Using first one with ID: {}", 
                name, email, member.getId());
        }
        logger.info("Found member with ID: {}", member.getId());
        return member;
    }

    private MemberDto convertToDto(Member member) {
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setName(member.getName());
        dto.setEmail(member.getEmail());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setAdmin(member.isAdmin());
        return dto;
    }
} 