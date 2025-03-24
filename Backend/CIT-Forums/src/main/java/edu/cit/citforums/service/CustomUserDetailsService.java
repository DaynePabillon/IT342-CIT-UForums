package edu.cit.citforums.service;

import edu.cit.citforums.models.Member;
import edu.cit.citforums.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private MemberRepository memberRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // Let users login with either email or username
        Member member = memberRepository.findByEmail(usernameOrEmail)
                .orElseGet(() -> memberRepository.findByName(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + usernameOrEmail))
                );

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // Add ROLE_USER for all members
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        // Add ROLE_ADMIN if member is admin
        if (member.isAdmin()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return new User(
                member.getEmail(),
                member.getPassword(),
                authorities
        );
    }
} 