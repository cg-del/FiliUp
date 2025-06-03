package edu.cit.filiup.controller;

import edu.cit.filiup.dto.EnrollmentResponseDTO;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.EnrollmentService;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final UserService userService;
    


    
    @Autowired
    public EnrollmentController(EnrollmentService enrollmentService, UserRepository userRepository, UserService userService) {
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @PostMapping("/enroll")
    @RequireRole("STUDENT")
    public ResponseEntity<?> enrollStudent(
            @RequestBody Map<String, String> payload) {
        try {
            String classCode = payload.get("classCode");
            
            if (classCode == null || classCode.trim().isEmpty()) {
                return ResponseUtil.badRequest("Class code is required");
            }

            // Extract user identifier from authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseUtil.unauthorized("No authentication found");
            }
            
            String userIdentifier = authentication.getName();
            UserEntity user = null;
            
            // Try to get user by email first
            user = userService.getUserByEmail(userIdentifier);
            
            if (user == null) {
                // Fallback to username
                user = userService.getUserByUsername(userIdentifier);
            }
            
            if (user == null) {
                return ResponseUtil.unauthorized("User not found");
            }
            
            // Verify the user is a student
            if (!"STUDENT".equals(user.getUserRole())) {
                return ResponseUtil.forbidden("Only students can enroll in classes");
            }

            // Enroll student with is_accepted = false by default
            enrollmentService.enrollStudent(user.getUserId(), classCode);
            
            return ResponseUtil.success("Enrollment request submitted successfully. Waiting for teacher approval.");
        } catch (IllegalStateException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to enroll: " + e.getMessage());
        }
    }

    @GetMapping("/class/{classId}")
    @RequireRole("TEACHER")
    public ResponseEntity<?> getPendingEnrollmentsByClassId(@PathVariable UUID classId) {
        try {
            // Get only pending enrollments (is_accepted = false)
            List<EnrollmentResponseDTO> pendingEnrollments = enrollmentService.getPendingEnrollmentsByClassId(classId);
            return ResponseUtil.success("Pending enrollments retrieved successfully", pendingEnrollments);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve pending enrollments: " + e.getMessage());
        }
    }

    @PostMapping("/accept/{classCode}/{studentId}")
    @RequireRole("TEACHER")
    public ResponseEntity<?> acceptStudent(
            @PathVariable UUID studentId,
            @PathVariable String classCode) {
        try {
            enrollmentService.acceptStudent(studentId, classCode);
            return ResponseUtil.success("Student accepted successfully");
        } catch (IllegalStateException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to accept student: " + e.getMessage());
        }
    }

    @PostMapping("/accept-multiple")
    @RequireRole("TEACHER")
    public ResponseEntity<?> acceptMultipleStudents(
            @RequestParam String classCode,
            @RequestBody List<UUID> studentIds) {
        try {
            enrollmentService.acceptMultipleStudents(studentIds, classCode);
            return ResponseUtil.success("Students accepted successfully");
        } catch (IllegalStateException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to accept students: " + e.getMessage());
        }
    }
}