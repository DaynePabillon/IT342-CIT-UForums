package edu.cit.backend3.controller;

import edu.cit.backend3.dto.MemberDto;
import edu.cit.backend3.dto.request.LoginRequest;
import edu.cit.backend3.dto.request.MemberRegistrationRequest;
import edu.cit.backend3.dto.response.ApiResponse;
import edu.cit.backend3.dto.response.JwtAuthResponse;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.security.JwtTokenProvider;
import edu.cit.backend3.service.MemberService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger logger = LoggerFactory.getLogger(ApiAuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private MemberService memberService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<MemberDto> registerMember(@Valid @RequestBody MemberRegistrationRequest registrationRequest) {
        MemberDto registeredMember = memberService.registerMember(registrationRequest);
        return new ResponseEntity<>(registeredMember, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateMember(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Login attempt for user: {}", loginRequest.getUsernameOrEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get token from token provider
            String token = tokenProvider.generateToken(authentication);
            logger.info("Login successful for user: {}", loginRequest.getUsernameOrEmail());

            return ResponseEntity.ok(new JwtAuthResponse(token));
        } catch (Exception e) {
            logger.error("Login failed for user: {} - Error: {}", loginRequest.getUsernameOrEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<JwtAuthResponse> authenticateAdmin(@Valid @RequestBody LoginRequest loginRequest) {
        logger.info("Admin login attempt for user: {}", loginRequest.getUsernameOrEmail());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Check if the user is an admin
            MemberDto member = memberService.getMemberByUsernameOrEmail(loginRequest.getUsernameOrEmail());
            if (member.getRole() == null || !member.getRole().equals("ROLE_ADMIN")) {
                logger.error("Admin login failed - User is not an admin: {}", loginRequest.getUsernameOrEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = tokenProvider.generateToken(authentication);
            logger.info("Admin login successful for user: {}", loginRequest.getUsernameOrEmail());

            return ResponseEntity.ok(new JwtAuthResponse(token));
        } catch (Exception e) {
            logger.error("Admin login failed for user: {} - Error: {}", loginRequest.getUsernameOrEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/admin/make-admin/{username}")
    public ResponseEntity<ApiResponse> makeAdmin(@PathVariable String username) {
        try {
            // Get the member entity directly from the repository
            Member member = memberRepository.findByName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Update the admin status
            member.setAdmin(true);
            memberRepository.save(member);

            logger.info("Successfully made user {} an admin", username);
            return ResponseEntity.ok(new ApiResponse(true, "User is now an admin"));
        } catch (Exception e) {
            logger.error("Error making user admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to make user admin"));
        }
    }

    @GetMapping("/check-admin")
    public ResponseEntity<ApiResponse> checkAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Not authenticated"));
            }

            String username = authentication.getName();
            Member member = memberRepository.findByName(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (member.getRole() == null || !member.getRole().equals("ROLE_ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "User is not an admin"));
            }

            return ResponseEntity.ok(new ApiResponse(true, "User is an admin"));
        } catch (Exception e) {
            logger.error("Error checking admin status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Failed to check admin status"));
        }
    }
} 