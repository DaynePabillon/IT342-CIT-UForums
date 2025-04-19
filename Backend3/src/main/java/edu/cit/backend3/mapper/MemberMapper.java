package edu.cit.backend3.mapper;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.models.Member;
import org.springframework.stereotype.Component;

@Component
public class MemberMapper {
    
    public MemberDto toDto(Member member) {
        if (member == null) {
            return null;
        }
        
        MemberDto dto = new MemberDto();
        dto.setId(member.getId());
        dto.setUsername(member.getName());
        dto.setEmail(member.getEmail());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setRole(member.getRole());
        dto.setStatus(member.getStatus());
        dto.setCreatedAt(member.getCreatedAt() != null ? member.getCreatedAt().toString() : null);
        return dto;
    }
    
    public Member toEntity(MemberDto dto) {
        if (dto == null) {
            return null;
        }
        
        Member member = new Member();
        member.setId(dto.getId());
        member.setName(dto.getUsername());
        member.setEmail(dto.getEmail());
        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setStatus(dto.getStatus());
        // Note: We don't set the role directly as it's managed by roles collection
        return member;
    }
}