package edu.cit.backend3.controller;

import edu.cit.backend3.dto.ThreadDto;
import edu.cit.backend3.service.ThreadService;
import edu.cit.backend3.payload.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ThreadService threadService;

    @GetMapping("/threads")
    public ResponseEntity<?> getAllThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<ThreadDto> threads = threadService.getAllThreads(page, size);
            return ResponseEntity.ok(new ApiResponse(true, "Threads retrieved successfully", threads));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new ApiResponse(false, "Error retrieving threads: " + e.getMessage()));
        }
    }

    // Add more admin endpoints here as needed
} 