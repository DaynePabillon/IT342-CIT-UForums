package edu.cit.backend3.service.impl;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.service.MemberService;
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
        if (existsByName(registrationRequest.getName())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        Member member = new Member();
        member.setName(registrationRequest.getName());
        member.setEmail(registrationRequest.getEmail());
        member.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        member.setFirstName(registrationRequest.getFirstName());
        member.setLastName(registrationRequest.getLastName());
        member.setAdmin(false);

        Member savedMember = memberRepository.save(member);
        return convertToDto(savedMember);
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
            member.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
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
        Member member = memberRepository.findByNameOrEmail(usernameOrEmail, usernameOrEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(member);
    }

    @Override
    public Member findByNameOrEmail(String name, String email) {
        return memberRepository.findByNameOrEmail(name, email)
            .orElseThrow(() -> new RuntimeException("Member not found"));
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