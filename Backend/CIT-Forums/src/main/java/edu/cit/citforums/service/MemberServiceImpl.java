package edu.cit.citforums.service;

import edu.cit.citforums.dto.MemberDto;
import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.request.MemberRegistrationRequest;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public MemberDto registerMember(MemberRegistrationRequest registrationRequest) {
        // Check if username already exists
        if (existsByName(registrationRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Check if email already exists
        if (existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }
        
        // Create new member
        Member member = new Member();
        member.setName(registrationRequest.getName());
        member.setEmail(registrationRequest.getEmail());
        member.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        member.setFirstName(registrationRequest.getFirstName());
        member.setLastName(registrationRequest.getLastName());
        member.setAdmin(false); // Default is not admin
        
        // Save member
        Member savedMember = saveMember(member);
        
        // Convert to DTO and return
        return mapToDto(savedMember);
    }

    @Override
    public MemberDto getMember(Long memberId) {
        Member member = getMemberEntity(memberId);
        return mapToDto(member);
    }

    @Override
    public MemberDto getMemberByName(String name) {
        Member member = memberRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Member not found with name: " + name));
        return mapToDto(member);
    }

    @Override
    public List<MemberDto> getAllMembers() {
        List<Member> members = memberRepository.findAll();
        return members.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MemberDto updateMember(Long memberId, MemberRegistrationRequest updateRequest) {
        Member member = getMemberEntity(memberId);
        
        // Only update fields that are not null
        if (updateRequest.getName() != null && !updateRequest.getName().equals(member.getName())) {
            if (existsByName(updateRequest.getName())) {
                throw new RuntimeException("Username is already taken!");
            }
            member.setName(updateRequest.getName());
        }
        
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(member.getEmail())) {
            if (existsByEmail(updateRequest.getEmail())) {
                throw new RuntimeException("Email is already in use!");
            }
            member.setEmail(updateRequest.getEmail());
        }
        
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            member.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }
        
        if (updateRequest.getFirstName() != null) {
            member.setFirstName(updateRequest.getFirstName());
        }
        
        if (updateRequest.getLastName() != null) {
            member.setLastName(updateRequest.getLastName());
        }
        
        Member updatedMember = saveMember(member);
        return mapToDto(updatedMember);
    }

    @Override
    public void deleteMember(Long memberId) {
        Member member = getMemberEntity(memberId);
        memberRepository.delete(member);
    }

    @Override
    public Member getMemberEntity(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with ID: " + memberId));
    }

    @Override
    public MemberSummaryDto getMemberSummary(Long memberId) {
        Member member = getMemberEntity(memberId);
        return mapToSummaryDto(member);
    }

    @Override
    public boolean toggleAdminStatus(Long memberId) {
        Member member = getMemberEntity(memberId);
        member.setAdmin(!member.isAdmin());
        Member savedMember = saveMember(member);
        return savedMember.isAdmin();
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
    
    // Utility methods to map entities to DTOs
    private MemberDto mapToDto(Member member) {
        return MemberDto.builder()
                .id(member.getId())
                .name(member.getName())
                .email(member.getEmail())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .isAdmin(member.isAdmin())
                .build();
    }
    
    private MemberSummaryDto mapToSummaryDto(Member member) {
        return MemberSummaryDto.builder()
                .id(member.getId())
                .name(member.getName())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .isAdmin(member.isAdmin())
                .build();
    }
} 