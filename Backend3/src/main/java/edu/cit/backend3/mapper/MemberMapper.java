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
        dto.setName(member.getName());
        dto.setEmail(member.getEmail());
        dto.setFirstName(member.getFirstName());
        dto.setLastName(member.getLastName());
        dto.setAdmin(member.isAdmin());
        return dto;
    }
    
    public Member toEntity(MemberDto dto) {
        if (dto == null) {
            return null;
        }
        
        Member member = new Member();
        member.setId(dto.getId());
        member.setName(dto.getName());
        member.setEmail(dto.getEmail());
        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setAdmin(dto.isAdmin());
        return member;
    }
} 