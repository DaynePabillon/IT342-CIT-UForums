package edu.cit.backend3.service;

import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Role;
import edu.cit.backend3.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private MemberRepository memberRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Loading user by username/email: {}", username);
        
        // First try to find by exact email match
        logger.debug("Attempting to find user by email: {}", username);
        Optional<Member> memberByEmail = memberRepository.findByEmail(username);
        
        if (memberByEmail.isPresent()) {
            logger.info("User found by email: {}", username);
            Member member = memberByEmail.get();
            return buildUserDetails(member);
        }
        
        // If not found by email, try by exact username match
        logger.debug("User not found by email, attempting to find by username: {}", username);
        Optional<Member> memberByName = memberRepository.findByName(username);
        
        if (memberByName.isPresent()) {
            logger.info("User found by username: {}", username);
            Member member = memberByName.get();
            return buildUserDetails(member);
        }
        
        // If still not found, try a more flexible search
        logger.debug("User not found by exact matches, trying flexible search for: {}", username);
        List<Member> members = memberRepository.findByNameOrEmail(username, username);
        
        if (!members.isEmpty()) {
            logger.info("Found {} users with flexible search for: {}", members.size(), username);
            Member member = members.get(0);
            return buildUserDetails(member);
        }
        
        // Try to find by ID (in case username is a numeric ID)
        try {
            Long id = Long.parseLong(username);
            logger.debug("Attempting to find user by ID: {}", id);
            Optional<Member> memberById = memberRepository.findById(id);
            
            if (memberById.isPresent()) {
                logger.info("User found by ID: {}", id);
                Member member = memberById.get();
                return buildUserDetails(member);
            }
        } catch (NumberFormatException e) {
            // Not a numeric ID, ignore
            logger.debug("Username is not a numeric ID: {}", username);
        }
        
        // No user found with any method
        logger.error("User not found with any search method: {}", username);
        throw new UsernameNotFoundException("User not found");
    }
    
    private UserDetails buildUserDetails(Member member) {
        logger.info("Building UserDetails for member: id={}, name={}, email={}, active={}", 
            member.getId(), member.getName(), member.getEmail(), member.isActive());
            
        if (!member.isActive()) {
            logger.error("Account is not active: {}", member.getName());
            throw new UsernameNotFoundException("Account is not active");
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        // Check roles collection or admin flag
        try {
            if (member.getRoles() != null && !member.getRoles().isEmpty()) {
                // Add all roles from the roles collection
                for (Role role : member.getRoles()) {
                    String roleName = "ROLE_" + role.getName().name();
                    logger.info("Adding role {} for user {}", roleName, member.getName());
                    authorities.add(new SimpleGrantedAuthority(roleName));
                }
            }
        } catch (Exception e) {
            logger.warn("Error accessing roles collection for user {}: {}", member.getName(), e.getMessage());
            // Continue with the admin flag check
        }
        
        // Fallback to the admin flag if roles collection is empty or couldn't be accessed
        if (member.isAdmin()) { 
            logger.info("User {} is an admin (from admin flag), adding ROLE_ADMIN", member.getName());
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        
        // Use member ID as the username for UserDetails to ensure stability across username changes
        return new org.springframework.security.core.userdetails.User(
                String.valueOf(member.getId()),
                member.getPassword(),
                true, true, true, true,
                authorities
        );
    }
    
    @Transactional
    public UserDetails loadUserById(Long id) throws UsernameNotFoundException {
        logger.info("Loading user by ID: {}", id);
        Optional<Member> memberById = memberRepository.findById(id);
        
        if (memberById.isPresent()) {
            logger.info("User found by ID: {}", id);
            Member member = memberById.get();
            return buildUserDetails(member);
        }
        
        // No user found with the given ID
        logger.error("User not found with ID: {}", id);
        throw new UsernameNotFoundException("User not found");
    }
}