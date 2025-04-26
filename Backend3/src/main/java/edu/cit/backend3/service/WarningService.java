package edu.cit.backend3.service;

import edu.cit.backend3.dto.WarningDto;
import edu.cit.backend3.dto.IssueWarningRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Warning;

import java.util.List;

public interface WarningService {
    WarningDto issueWarning(IssueWarningRequest request, Member admin);
    WarningDto getWarningById(Long id);
    List<WarningDto> getWarningsForMember(Long memberId);
    List<WarningDto> getAllWarnings();
    WarningDto acknowledgeWarning(Long warningId, Member member);
    boolean banMemberIfNeeded(Member member);
}
