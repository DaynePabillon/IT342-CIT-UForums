package edu.cit.backend3.service;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.dto.request.ProfileUpdateRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.CommentDto;

import java.util.List;
import org.springframework.data.domain.Page;

public interface MemberService {
    
    MemberDto registerMember(MemberRegistrationRequest registrationRequest);
    
    MemberDto getMember(Long memberId);
    
    MemberDto getMemberByName(String name);
    
    MemberDto getMemberByEmail(String email);
    
    List<MemberDto> getAllMembers();
    
    MemberDto updateMember(Long memberId, MemberRegistrationRequest updateRequest);
    
    MemberDto updateProfile(Long memberId, ProfileUpdateRequest updateRequest);
    
    void deleteMember(Long memberId);
    
    Member getMemberEntity(Long memberId);
    
    MemberSummaryDto getMemberSummary(Long memberId);
    
    boolean existsByName(String name);
    
    boolean existsByEmail(String email);
    
    Member saveMember(Member member);

    MemberDto getMemberByUsernameOrEmail(String usernameOrEmail);

    Member findByNameOrEmail(String name, String email);

    Page<ThreadDto> getMemberThreads(Long memberId, int page, int size);
    
    Page<CommentDto> getMemberComments(Long memberId, int page, int size);
} 