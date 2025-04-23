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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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
    public ResponseEntity<?> authenticateMember(@RequestBody LoginRequest loginRequest) {
        try {
            // Clear any existing authentication
            SecurityContextHolder.clearContext();
            
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Set the authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get the user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            // In CustomUserDetailsService, we use the user ID as the username in UserDetails
            // We need to load the actual Member entity by ID
            Long userId;
            try {
                userId = Long.parseLong(username);
                logger.info("Parsed user ID from authentication: {}", userId);
            } catch (NumberFormatException e) {
                logger.error("Failed to parse user ID from authentication: {}", username);
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid user ID"));
            }
            
            // Get the Member entity using the ID
            Member member = memberService.getMemberEntity(userId);
            if (member == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }
            
            // Get the MemberDto
            MemberDto memberDto = memberService.getMember(userId);
            if (memberDto == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }
            
            // Generate JWT token
            String jwt = tokenProvider.generateToken(authentication);
            
            // Log the user information
            logger.info("User authenticated: id={}, username={}, email={}", 
                       member.getId(), member.getName(), member.getEmail());
            
            // Return JWT token and user information
            return ResponseEntity.ok(new JwtAuthResponse(jwt, memberDto));
        } catch (BadCredentialsException e) {
            logger.error("Authentication failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid username/email or password"));
        } catch (Exception e) {
            logger.error("Authentication error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "An error occurred during authentication"));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> authenticateAdmin(@RequestBody LoginRequest loginRequest) {
        try {
            // Clear any existing authentication
            SecurityContextHolder.clearContext();
            
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsernameOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Set the authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get the user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            
            // In CustomUserDetailsService, we use the user ID as the username in UserDetails
            // We need to load the actual Member entity by ID
            Long userId;
            try {
                userId = Long.parseLong(username);
                logger.info("Parsed user ID from authentication: {}", userId);
            } catch (NumberFormatException e) {
                logger.error("Failed to parse user ID from authentication: {}", username);
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid user ID"));
            }
            
            // Get the Member entity using the ID
            Member member = memberService.getMemberEntity(userId);
            if (member == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }
            
            // Check if the user is an admin
            if (!member.isAdmin()) {
                logger.warn("Non-admin user attempted to login as admin: {}", member.getName());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse(false, "Access denied: User is not an admin"));
            }
            
            // Get the MemberDto
            MemberDto memberDto = memberService.getMember(userId);
            if (memberDto == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "User not found"));
            }
            
            // Generate JWT token
            String jwt = tokenProvider.generateToken(authentication);
            
            // Log the admin login
            logger.info("Admin authenticated: id={}, username={}, email={}", 
                       member.getId(), member.getName(), member.getEmail());
            
            // Return JWT token and user information
            return ResponseEntity.ok(new JwtAuthResponse(jwt, memberDto));
        } catch (BadCredentialsException e) {
            logger.error("Admin authentication failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid username/email or password"));
        } catch (Exception e) {
            logger.error("Admin authentication error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "An error occurred during authentication"));
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

            if (!member.isAdmin()) {
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