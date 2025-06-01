package edu.cit.filiup.controller;

import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.EnrollmentService;
import edu.cit.filiup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;
    
    @Autowired
    private UserService userService;

    /**
     * Enrolls the authenticated user in a class using the class code
     *
     * @param requestBody containing classCode
     * @return ResponseEntity with the created enrollment entity or error message
     */
    @PostMapping("/enroll")
    public ResponseEntity<Map<String, Object>> enrollStudent(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        
        // Get the authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        UserEntity user = userService.getUserByEmail(userEmail);
        
        if (user == null) {
            response.put("error", "User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Extract class code from request body
        String classCode = null;
        if (requestBody.containsKey("classCode") && requestBody.get("classCode") != null) {
            classCode = requestBody.get("classCode").toString();
        }
        
        // Validate required parameters
        if (classCode == null || classCode.trim().isEmpty()) {
            response.put("error", "Class code is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            EnrollmentEntity enrollment = enrollmentService.enrollStudent(user.getUserId(), classCode);
            response.put("message", "Successfully enrolled");
            response.put("enrollment", enrollment);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Gets all enrollments for the authenticated user
     *
     * @return ResponseEntity with list of enrollments
     */
    @GetMapping("/user")
    public ResponseEntity<?> getEnrollmentsByUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            UserEntity user = userService.getUserByEmail(userEmail);
            
            if (user == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            List<EnrollmentEntity> enrollments = enrollmentService.getEnrollmentsByStudent(user.getUserId());
            return ResponseEntity.ok(enrollments);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    /**
     * Gets all enrollments for a class
     *
     * @param classCode the code of the class
     * @return ResponseEntity with list of enrollments
     */
    @GetMapping("/class/{classCode}")
    public ResponseEntity<?> getEnrollmentsByClass(@PathVariable String classCode) {
        try {
            List<EnrollmentEntity> enrollments = enrollmentService.getEnrollmentsByClass(classCode);
            return ResponseEntity.ok(enrollments);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}