package edu.cit.citforums.controller;

import edu.cit.citforums.dto.MemberDto;
import edu.cit.citforums.dto.request.MemberRegistrationRequest;
import edu.cit.citforums.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class ApiMemberController {

    @Autowired
    private MemberService memberService;
    
    @GetMapping("/{id}")
    public ResponseEntity<MemberDto> getMemberById(@PathVariable("id") Long id) {
        MemberDto member = memberService.getMember(id);
        return ResponseEntity.ok(member);
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<MemberDto> getMemberByName(@PathVariable("name") String name) {
        MemberDto member = memberService.getMemberByName(name);
        return ResponseEntity.ok(member);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MemberDto>> getAllMembers() {
        List<MemberDto> members = memberService.getAllMembers();
        return ResponseEntity.ok(members);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and (authentication.principal.id == #id or hasRole('ADMIN'))")
    public ResponseEntity<MemberDto> updateMember(
            @PathVariable("id") Long id,
            @Valid @RequestBody MemberRegistrationRequest updateRequest) {
        
        MemberDto updatedMember = memberService.updateMember(id, updateRequest);
        return ResponseEntity.ok(updatedMember);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<Void> deleteMember(@PathVariable("id") Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/toggle-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleAdminStatus(@PathVariable("id") Long id) {
        boolean newStatus = memberService.toggleAdminStatus(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsernameExists(@RequestParam String name) {
        boolean exists = memberService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
    
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = memberService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
} 