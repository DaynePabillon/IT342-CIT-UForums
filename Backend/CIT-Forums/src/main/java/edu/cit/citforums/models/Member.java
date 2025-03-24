package edu.cit.citforums.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isAdmin;
    
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active = true;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "member_roles",
        joinColumns = @JoinColumn(name = "member_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime lastLogin;

    // Username getter/setter for convenience with Spring Security
    public String getUsername() {
        return name;
    }
    
    public void setUsername(String username) {
        this.name = username;
    }
    
    // Convenience methods
    public boolean isAdmin() {
        return isAdmin;
    }
    
    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }
} 