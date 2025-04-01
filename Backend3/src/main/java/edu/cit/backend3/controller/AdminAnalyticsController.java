package edu.cit.backend3.controller;

import edu.cit.backend3.dto.response.UserActivityDTO;
import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.MemberRepository;
import edu.cit.backend3.repository.ThreadRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@Tag(name = "Analytics", description = "Platform analytics and statistics endpoints")
public class AdminAnalyticsController {

    private final MemberRepository memberRepository;
    private final ThreadRepository threadRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public AdminAnalyticsController(
            MemberRepository memberRepository,
            ThreadRepository threadRepository,
            CommentRepository commentRepository) {
        this.memberRepository = memberRepository;
        this.threadRepository = threadRepository;
        this.commentRepository = commentRepository;
    }

    @GetMapping("/user-activity")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get user activity metrics",
        description = "Retrieve user activity metrics over time",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<UserActivityDTO> getUserActivity(
            @Parameter(description = "Start date (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Group by (day, week, month)")
            @RequestParam(defaultValue = "day") String groupBy) {
        
        // Convert dates to LocalDateTime for querying
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        // Map groupBy to SQL date format strings
        String dateFormat;
        switch (groupBy.toLowerCase()) {
            case "week":
                dateFormat = "'YYYY-\"W\"WW'";  // Format as YYYY-Www
                break;
            case "month":
                dateFormat = "'YYYY-MM'";      // Format as YYYY-MM
                break;
            case "day":
            default:
                dateFormat = "'YYYY-MM-DD'";   // Format as YYYY-MM-DD
                break;
        }
        
        // Prepare result DTO
        UserActivityDTO result = new UserActivityDTO();
        result.setStartDate(startDate.format(DateTimeFormatter.ISO_DATE));
        result.setEndDate(endDate.format(DateTimeFormatter.ISO_DATE));
        result.setGroupBy(groupBy);
        
        // Get new user registrations by period
        Map<String, Integer> newUserRegistrations = getNewUserRegistrationsByPeriod(
                startDateTime, endDateTime, dateFormat);
        result.setNewUserRegistrations(newUserRegistrations);
        
        // Get thread creation metrics by period
        Map<String, Integer> threadCreations = getThreadCreationsByPeriod(
                startDateTime, endDateTime, dateFormat);
        result.setThreadCreations(threadCreations);
        
        // Get comment metrics by period
        Map<String, Integer> commentCreations = getCommentCreationsByPeriod(
                startDateTime, endDateTime, dateFormat);
        result.setCommentCreations(commentCreations);
        
        // Calculate active users (users who posted threads or comments)
        Map<String, Integer> activeUsers = getActiveUsersByPeriod(
                startDateTime, endDateTime, dateFormat);
        result.setActiveUsers(activeUsers);
        
        return ResponseEntity.ok(result);
    }
    
    private Map<String, Integer> getNewUserRegistrationsByPeriod(
            LocalDateTime startDateTime, LocalDateTime endDateTime, String dateFormat) {
        // Get counts of new user registrations by period
        List<Object[]> registrationCounts = memberRepository.countRegistrationsByPeriod(
                startDateTime, endDateTime, dateFormat);
        
        // Convert to map format
        Map<String, Integer> result = new HashMap<>();
        for (Object[] count : registrationCounts) {
            String period = count[0].toString();
            Integer countValue = ((Number) count[1]).intValue();
            result.put(period, countValue);
        }
        
        return fillMissingPeriods(result, startDateTime, endDateTime, periodFromDateFormat(dateFormat));
    }
    
    private Map<String, Integer> getThreadCreationsByPeriod(
            LocalDateTime startDateTime, LocalDateTime endDateTime, String dateFormat) {
        // Get counts of thread creations by period
        List<Object[]> threadCounts = threadRepository.countThreadsByPeriod(
                startDateTime, endDateTime, dateFormat);
        
        // Convert to map format
        Map<String, Integer> result = new HashMap<>();
        for (Object[] count : threadCounts) {
            String period = count[0].toString();
            Integer countValue = ((Number) count[1]).intValue();
            result.put(period, countValue);
        }
        
        return fillMissingPeriods(result, startDateTime, endDateTime, periodFromDateFormat(dateFormat));
    }
    
    private Map<String, Integer> getCommentCreationsByPeriod(
            LocalDateTime startDateTime, LocalDateTime endDateTime, String dateFormat) {
        // Get counts of comment creations by period
        List<Object[]> commentCounts = commentRepository.countCommentsByPeriod(
                startDateTime, endDateTime, dateFormat);
        
        // Convert to map format
        Map<String, Integer> result = new HashMap<>();
        for (Object[] count : commentCounts) {
            String period = count[0].toString();
            Integer countValue = ((Number) count[1]).intValue();
            result.put(period, countValue);
        }
        
        return fillMissingPeriods(result, startDateTime, endDateTime, periodFromDateFormat(dateFormat));
    }
    
    private Map<String, Integer> getActiveUsersByPeriod(
            LocalDateTime startDateTime, LocalDateTime endDateTime, String dateFormat) {
        // Get counts of active users by period
        List<Object[]> activeUserCounts = memberRepository.countActiveUsersByPeriod(
                startDateTime, endDateTime, dateFormat);
        
        // Convert to map format
        Map<String, Integer> result = new HashMap<>();
        for (Object[] count : activeUserCounts) {
            String period = count[0].toString();
            Integer countValue = ((Number) count[1]).intValue();
            result.put(period, countValue);
        }
        
        return fillMissingPeriods(result, startDateTime, endDateTime, periodFromDateFormat(dateFormat));
    }
    
    private String periodFromDateFormat(String sqlDateFormat) {
        // Convert SQL date format to Java period type
        if (sqlDateFormat.contains("WW")) {
            return "week";
        } else if (sqlDateFormat.contains("MM") && !sqlDateFormat.contains("DD")) {
            return "month";
        } else {
            return "day";
        }
    }
    
    private Map<String, Integer> fillMissingPeriods(
            Map<String, Integer> data, 
            LocalDateTime startDateTime, 
            LocalDateTime endDateTime, 
            String groupBy) {
        
        // Generate all period labels between start and end date
        List<String> allPeriods = generatePeriodLabels(startDateTime, endDateTime, groupBy);
        
        // Fill in missing periods with zero values
        Map<String, Integer> result = new HashMap<>();
        for (String period : allPeriods) {
            result.put(period, data.getOrDefault(period, 0));
        }
        
        return result;
    }
    
    private List<String> generatePeriodLabels(
            LocalDateTime startDateTime, 
            LocalDateTime endDateTime, 
            String groupBy) {
        
        List<String> periods = new ArrayList<>();
        LocalDateTime current = startDateTime;
        
        DateTimeFormatter formatter;
        switch (groupBy.toLowerCase()) {
            case "week":
                formatter = DateTimeFormatter.ofPattern("yyyy-'W'ww");
                while (current.isBefore(endDateTime)) {
                    periods.add(current.format(formatter));
                    current = current.plusWeeks(1);
                }
                break;
            case "month":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM");
                while (current.isBefore(endDateTime)) {
                    periods.add(current.format(formatter));
                    current = current.plusMonths(1);
                }
                break;
            case "day":
            default:
                formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                while (current.isBefore(endDateTime)) {
                    periods.add(current.format(formatter));
                    current = current.plusDays(1);
                }
                break;
        }
        
        return periods;
    }
} 