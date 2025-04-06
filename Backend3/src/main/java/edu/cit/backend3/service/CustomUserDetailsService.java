package edu.cit.backend3.service;

import edu.cit.backend3.models.Member;
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
import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private MemberRepository memberRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Loading user by username/email: {}", username);
        
        List<Member> members = memberRepository.findByNameOrEmail(username, username);
        logger.debug("Found {} members matching username/email: {}", members.size(), username);
        
        if (members.isEmpty()) {
            logger.error("User not found: {}", username);
            throw new UsernameNotFoundException("User not found");
        }
        
        // Take the first member if multiple exist
        Member member = members.get(0);
        if (members.size() > 1) {
            logger.warn("Multiple users found for username/email: {}. Using first one with ID: {}", 
                username, member.getId());
        }
        
        logger.info("Found member: name={}, email={}, password={}, active={}, isAdmin={}", 
            member.getName(), member.getEmail(), member.getPassword(), member.isActive(), member.isAdmin());
            
        if (!member.isActive()) {
            logger.error("Account is not active: {}", username);
            throw new UsernameNotFoundException("Account is not active");
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        if (member.isAdmin()) {
            logger.info("User {} is an admin, adding ROLE_ADMIN", username);
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }
        
        return new org.springframework.security.core.userdetails.User(
                member.getName(),
                member.getPassword(),
                true, true, true, true,
                authorities
        );
    }
} 