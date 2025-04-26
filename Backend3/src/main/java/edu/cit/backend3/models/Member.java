package edu.cit.backend3.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "warning_count", nullable = false)
    @Builder.Default
    private int warningCount = 0;

    @Column(name = "is_banned", nullable = false)
    @Builder.Default
    private boolean banned = false;

    @Column(name = "ban_reason")
    private String banReason;

    @Column(name = "banned_until")
    private LocalDateTime bannedUntil;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "is_admin", nullable = false)
    @Builder.Default
    private boolean admin = false;

    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "student_number")
    private String studentNumber;
    
    @Column(name = "city")
    private String city;
    
    @Column(name = "province")
    private String province;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "bio", length = 500)
    private String bio;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "member_roles",
        joinColumns = @JoinColumn(name = "member_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Username getter/setter for convenience with Spring Security
    public String getUsername() {
        return name;
    }
    
    public void setUsername(String username) {
        this.name = username;
    }
    
    // Get the highest role for the user
    public String getRole() {
        if (roles == null || roles.isEmpty()) {
            return admin ? "ROLE_ADMIN" : "ROLE_USER";
        }
        
        // Check if user has admin role
        for (Role role : roles) {
            if (role.getName().name().equals("ADMIN")) {
                return "ROLE_ADMIN";
            }
        }
        
        // Return the first role or default to USER
        return "ROLE_" + roles.iterator().next().getName().name();
    }

    public Long getId() {
        return id;
    }
}