package edu.cit.backend3.controller;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.request.LoginRequest;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.dto.response.ApiResponse;
import edu.cit.backend3.dto.response.JwtAuthResponse;
import edu.cit.backend3.security.JwtTokenProvider;
import edu.cit.backend3.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MemberService memberService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<MemberDto> registerMember(@Valid @RequestBody MemberRegistrationRequest registrationRequest) {
        MemberDto registeredMember = memberService.registerMember(registrationRequest);
        return new ResponseEntity<>(registeredMember, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateMember(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get token from token provider
        String token = tokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new JwtAuthResponse(token));
    }
} 