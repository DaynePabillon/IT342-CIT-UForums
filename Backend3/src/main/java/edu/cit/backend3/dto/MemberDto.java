package edu.cit.backend3.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private List<String> roles;
    private String status;
    private String createdAt;
    private String phoneNumber;
    private String studentNumber;
    private String city;
    private String province;
    private String address;
    private String bio;
}