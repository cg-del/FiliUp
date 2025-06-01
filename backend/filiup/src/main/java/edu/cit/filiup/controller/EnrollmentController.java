package edu.cit.filiup.controller;

import edu.cit.filiup.dto.EnrollmentResponseDTO;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.EnrollmentService;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
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
    


    
    @Autowired
    public EnrollmentController(EnrollmentService enrollmentService, UserRepository userRepository) {
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/enroll")
    @RequireRole("STUDENT")
    public ResponseEntity<?> enrollStudent(
            @RequestBody Map<String, String> payload,
            JwtAuthenticationToken token) {
        try {
            String classCode = payload.get("classCode");
            if (classCode == null || classCode.trim().isEmpty()) {
                return ResponseUtil.badRequest("Class code is required");
            }

            // Extract email from JWT token
            String userEmail = token.getToken().getSubject();
            
            // Get user by email
            UserEntity user = userRepository.findByUserEmail(userEmail);
            if (user == null) {
                throw new IllegalStateException("User not found");
            }

            enrollmentService.enrollStudent(user.getUserId(), classCode);
            return ResponseUtil.success("Successfully enrolled in class");
        } catch (IllegalStateException e) {
            return ResponseUtil.badRequest(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to enroll: " + e.getMessage());
        }
    }

    @GetMapping("/class/{classCode}")
    @RequireRole("TEACHER")
    public ResponseEntity<?> getEnrollmentsByClassCode(@PathVariable String classCode) {
        try {
            List<EnrollmentResponseDTO> enrollments = enrollmentService.getEnrollmentsByClassCode(classCode);
            return ResponseUtil.success("Enrollments retrieved successfully", enrollments);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve enrollments: " + e.getMessage());
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