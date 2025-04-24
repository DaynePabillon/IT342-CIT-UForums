package edu.cit.backend3.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String status;
    private String createdAt;
    private String phoneNumber;
    private String city;
    private String province;
    private String address;
    private String bio;
}