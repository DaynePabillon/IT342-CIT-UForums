package edu.cit.backend3.service;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.dto.request.ProfileUpdateRequest;
import edu.cit.backend3.mapper.CommentMapper;
import edu.cit.backend3.mapper.MemberMapper;
import edu.cit.backend3.mapper.ThreadMapper;
import edu.cit.backend3.models.Comment;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Thread;
import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.ThreadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MemberServiceImpl implements MemberService {

    private static final Logger logger = LoggerFactory.getLogger(MemberServiceImpl.class);

    private final MemberRepository memberRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;
    private final MemberMapper memberMapper;
    private final ThreadMapper threadMapper;
    private final CommentMapper commentMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public MemberServiceImpl(
            MemberRepository memberRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository,
            MemberMapper memberMapper,
            ThreadMapper threadMapper,
            CommentMapper commentMapper,
            PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
        this.memberMapper = memberMapper;
        this.threadMapper = threadMapper;
        this.commentMapper = commentMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public MemberDto registerMember(MemberRegistrationRequest registrationRequest) {
        logger.info("Starting member registration process");
        logger.info("Registration request: name={}, email={}", registrationRequest.getName(), registrationRequest.getEmail());
        
        try {
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
            member.setPassword(registrationRequest.getPassword());
            member.setFirstName(registrationRequest.getFirstName());
            member.setLastName(registrationRequest.getLastName());
            member.setPhoneNumber(registrationRequest.getPhoneNumber());
            member.setStudentNumber(registrationRequest.getStudentNumber());
            member.setCity(registrationRequest.getCity());
            member.setProvince(registrationRequest.getProvince());
            member.setAddress(registrationRequest.getAddress());
            member.setBio(registrationRequest.getBio());
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
        // First try to find by name or email
        List<Member> members = memberRepository.findByNameOrEmail(usernameOrEmail, usernameOrEmail);
        
        // If not found, try to parse as ID
        if (members.isEmpty()) {
            try {
                Long id = Long.parseLong(usernameOrEmail);
                Optional<Member> memberById = memberRepository.findById(id);
                if (memberById.isPresent()) {
                    return convertToDto(memberById.get());
                }
            } catch (NumberFormatException e) {
                // Not a numeric ID, ignore
                logger.debug("Username is not a numeric ID: {}", usernameOrEmail);
            }
            
            throw new RuntimeException("User not found");
        }
        
        Member member = members.get(0);
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
        Member member = members.get(0);
        if (members.size() > 1) {
            logger.warn("Multiple users found for name/email: {}/{}. Using first one with ID: {}", 
                name, email, member.getId());
        }
        logger.info("Found member with ID: {}", member.getId());
        return member;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public MemberDto updateProfile(Long memberId, ProfileUpdateRequest updateRequest) {
        logger.info("Updating profile for member ID: {} with request: {}", memberId, updateRequest);
        
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        logger.info("Found member to update: {}", member);

        boolean updated = false;
        
        // Only update fields that are provided in the request and not null/empty
        if (updateRequest.getName() != null && !updateRequest.getName().isEmpty()) {
            if (!member.getName().equals(updateRequest.getName()) && existsByName(updateRequest.getName())) {
                logger.error("Username is already taken: {}", updateRequest.getName());
                throw new RuntimeException("Username is already taken!");
            }
            logger.info("Updating name from '{}' to '{}'", member.getName(), updateRequest.getName());
            member.setName(updateRequest.getName());
            updated = true;
        }

        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty()) {
            if (!member.getEmail().equals(updateRequest.getEmail()) && existsByEmail(updateRequest.getEmail())) {
                logger.error("Email is already in use: {}", updateRequest.getEmail());
                throw new RuntimeException("Email is already in use!");
            }
            logger.info("Updating email from '{}' to '{}'", member.getEmail(), updateRequest.getEmail());
            member.setEmail(updateRequest.getEmail());
            updated = true;
        }

        if (updateRequest.getFirstName() != null) {
            logger.info("Updating firstName from '{}' to '{}'", member.getFirstName(), updateRequest.getFirstName());
            member.setFirstName(updateRequest.getFirstName());
            updated = true;
        }

        if (updateRequest.getLastName() != null) {
            logger.info("Updating lastName from '{}' to '{}'", member.getLastName(), updateRequest.getLastName());
            member.setLastName(updateRequest.getLastName());
            updated = true;
        }

        if (updateRequest.getPhoneNumber() != null) {
            logger.info("Updating phoneNumber from '{}' to '{}'", member.getPhoneNumber(), updateRequest.getPhoneNumber());
            member.setPhoneNumber(updateRequest.getPhoneNumber());
            updated = true;
        }

        if (updateRequest.getStudentNumber() != null) {
            logger.info("Updating studentNumber from '{}' to '{}'", member.getStudentNumber(), updateRequest.getStudentNumber());
            member.setStudentNumber(updateRequest.getStudentNumber());
            updated = true;
        }

        if (updateRequest.getCity() != null) {
            logger.info("Updating city from '{}' to '{}'", member.getCity(), updateRequest.getCity());
            member.setCity(updateRequest.getCity());
            updated = true;
        }

        if (updateRequest.getProvince() != null) {
            logger.info("Updating province from '{}' to '{}'", member.getProvince(), updateRequest.getProvince());
            member.setProvince(updateRequest.getProvince());
            updated = true;
        }

        if (updateRequest.getAddress() != null) {
            logger.info("Updating address from '{}' to '{}'", member.getAddress(), updateRequest.getAddress());
            member.setAddress(updateRequest.getAddress());
            updated = true;
        }

        if (updateRequest.getBio() != null) {
            logger.info("Updating bio from '{}' to '{}'", member.getBio(), updateRequest.getBio());
            member.setBio(updateRequest.getBio());
            updated = true;
        }

        Member updatedMember;
        if (updated) {
            logger.info("Saving updated member: {}", member);
            updatedMember = memberRepository.save(member);
            logger.info("Profile updated successfully for member ID: {}, updated entity: {}", memberId, updatedMember);
        } else {
            logger.info("No changes detected, skipping database update");
            updatedMember = member;
        }
        
        return convertToDto(updatedMember);
    }

    @Override
    public Page<ThreadDto> getMemberThreads(Long memberId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        Page<Thread> threads = threadRepository.findByAuthorId(memberId, pageRequest);
        return threads.map(threadMapper::toDto);
    }
    
    @Override
    public Page<CommentDto> getMemberComments(Long memberId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        Page<Comment> comments = commentRepository.findByAuthorId(memberId, pageRequest);
        return comments.map(commentMapper::toDto);
    }

    private MemberDto convertToDto(Member member) {
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setUsername(member.getName());
        dto.setEmail(member.getEmail());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setRole(member.getRole());
        dto.setStatus(member.getStatus());
        dto.setCreatedAt(member.getCreatedAt() != null ? member.getCreatedAt().toString() : null);
        dto.setPhoneNumber(member.getPhoneNumber());
        dto.setStudentNumber(member.getStudentNumber());
        dto.setCity(member.getCity());
        dto.setProvince(member.getProvince());
        dto.setAddress(member.getAddress());
        dto.setBio(member.getBio());
        return dto;
    }
} 