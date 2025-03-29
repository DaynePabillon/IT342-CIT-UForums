package edu.cit.citforums.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberSummaryDto {
    private Long id;
    private String name;
    private String firstName;
    private String lastName;
    private String email;
} 