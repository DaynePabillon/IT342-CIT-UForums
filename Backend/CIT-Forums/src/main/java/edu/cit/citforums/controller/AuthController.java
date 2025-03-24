package edu.cit.citforums.controller;

import edu.cit.citforums.models.Member;
import edu.cit.citforums.payload.ApiResponse;
import edu.cit.citforums.payload.JwtAuthResponse;
import edu.cit.citforums.payload.LoginRequest;
import edu.cit.citforums.payload.RegisterRequest;
import edu.cit.citforums.repository.MemberRepository;
import edu.cit.citforums.security.JwtTokenProvider;
import edu.cit.citforums.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

// This controller has been replaced by ApiAuthController
// Commenting out the @RestController annotation to disable it
// @RestController
@RequestMapping("/api/auth/legacy")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MemberService memberService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        
        Member member = memberRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create user details to return
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("id", member.getId());
        userDetails.put("email", member.getEmail());
        userDetails.put("username", member.getName());
        userDetails.put("firstName", member.getFirstName());
        userDetails.put("lastName", member.getLastName());
        userDetails.put("isAdmin", member.isAdmin());
        
        return ResponseEntity.ok(new JwtAuthResponse(jwt, userDetails));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (memberRepository.existsByEmail(registerRequest.getEmail())) {
            return new ResponseEntity<>(new ApiResponse(false, "Email is already taken!"),
                    HttpStatus.BAD_REQUEST);
        }

        // Creating member
        Member member = new Member();
        member.setName(registerRequest.getUsername());
        member.setEmail(registerRequest.getEmail());
        member.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        member.setFirstName(registerRequest.getFirstName());
        member.setLastName(registerRequest.getLastName());
        member.setAdmin(false); // Default is regular user, not admin
        
        Member result = memberService.saveMember(member);

        String jwt = tokenProvider.generateTokenFromMember(result);
        
        // Create user details to return
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("id", result.getId());
        userDetails.put("email", result.getEmail());
        userDetails.put("username", result.getName());
        userDetails.put("firstName", result.getFirstName());
        userDetails.put("lastName", result.getLastName());
        userDetails.put("isAdmin", result.isAdmin());

        return ResponseEntity.ok(new JwtAuthResponse(jwt, userDetails));
    }
} 