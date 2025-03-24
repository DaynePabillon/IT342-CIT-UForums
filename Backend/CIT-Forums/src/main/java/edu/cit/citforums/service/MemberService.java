package edu.cit.citforums.service;

import edu.cit.citforums.dto.MemberDto;
import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.request.MemberRegistrationRequest;
import edu.cit.citforums.models.Member;

import java.util.List;

public interface MemberService {
    
    MemberDto registerMember(MemberRegistrationRequest registrationRequest);
    
    MemberDto getMember(Long memberId);
    
    MemberDto getMemberByName(String name);
    
    List<MemberDto> getAllMembers();
    
    MemberDto updateMember(Long memberId, MemberRegistrationRequest updateRequest);
    
    void deleteMember(Long memberId);
    
    Member getMemberEntity(Long memberId);
    
    MemberSummaryDto getMemberSummary(Long memberId);
    
    boolean toggleAdminStatus(Long memberId);
    
    boolean existsByName(String name);
    
    boolean existsByEmail(String email);
    
    Member saveMember(Member member);
} 