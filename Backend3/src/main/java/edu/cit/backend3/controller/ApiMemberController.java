package edu.cit.backend3.controller;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.dto.request.ProfileUpdateRequest;
import edu.cit.backend3.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/members")
public class ApiMemberController {

    @Autowired
    private MemberService memberService;
    
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MemberDto> getCurrentMember(Principal principal) {
        MemberDto member = memberService.getMemberByUsernameOrEmail(principal.getName());
        return ResponseEntity.ok(member);
    }
    
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MemberDto> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest updateRequest,
            Principal principal) {
        MemberDto currentMember = memberService.getMemberByUsernameOrEmail(principal.getName());
        MemberDto updatedMember = memberService.updateProfile(currentMember.getId(), updateRequest);
        return ResponseEntity.ok(updatedMember);
    }
    
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
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and authentication.principal.id == #id")
    public ResponseEntity<MemberDto> updateMember(
            @PathVariable("id") Long id,
            @Valid @RequestBody MemberRegistrationRequest updateRequest) {
        
        MemberDto updatedMember = memberService.updateMember(id, updateRequest);
        return ResponseEntity.ok(updatedMember);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("authentication.principal.id == #id")
    public ResponseEntity<Void> deleteMember(@PathVariable("id") Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
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
    
    @GetMapping("/me/threads")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ThreadDto>> getCurrentMemberThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        MemberDto member = memberService.getMemberByUsernameOrEmail(principal.getName());
        Page<ThreadDto> threads = memberService.getMemberThreads(member.getId(), page, size);
        return ResponseEntity.ok(threads);
    }
    
    @GetMapping("/me/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<CommentDto>> getCurrentMemberComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        MemberDto member = memberService.getMemberByUsernameOrEmail(principal.getName());
        Page<CommentDto> comments = memberService.getMemberComments(member.getId(), page, size);
        return ResponseEntity.ok(comments);
    }
} 