package edu.cit.backend3.service;

import edu.cit.backend3.dto.CreateWarningRequest;
import edu.cit.backend3.dto.WarningDto;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Warning;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WarningService {
    /**
     * Create a warning for a user
     * @param request The warning request
     * @param warnedBy The admin/moderator who issued the warning
     * @return The created warning
     */
    WarningDto createWarning(CreateWarningRequest request, Member warnedBy);
    
    /**
     * Get warnings for a specific user
     * @param memberId The ID of the user
     * @param pageable Pagination information
     * @return Page of warnings
     */
    Page<WarningDto> getWarningsForMember(Long memberId, Pageable pageable);
    
    /**
     * Get warnings issued by a specific admin/moderator
     * @param adminId The ID of the admin/moderator
     * @param pageable Pagination information
     * @return Page of warnings
     */
    Page<WarningDto> getWarningsIssuedBy(Long adminId, Pageable pageable);
    
    /**
     * Get all warnings in the system
     * @param pageable Pagination information
     * @return Page of warnings
     */
    Page<WarningDto> getAllWarnings(Pageable pageable);
    
    /**
     * Get a warning by ID
     * @param warningId The warning ID
     * @return The warning
     */
    WarningDto getWarningById(Long warningId);
    
    /**
     * Ban a user directly
     * @param memberId The ID of the user to ban
     * @param reason The reason for the ban
     * @param bannedBy The admin who banned the user
     * @return The updated member
     */
    Member banMember(Long memberId, String reason, Member bannedBy);
    
    /**
     * Unban a user
     * @param memberId The ID of the user to unban
     * @return The updated member
     */
    Member unbanMember(Long memberId);
}
