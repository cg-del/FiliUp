package edu.cit.filiup.controller;

import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    /**
     * Enrolls a user in a class using the class code
     *
     * @param requestBody containing userId and classCode
     * @return ResponseEntity with the created enrollment entity or error message
     */
    @PostMapping("/enroll")
    public ResponseEntity<Map<String, Object>> enrollStudent(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        
        // Extract and validate parameters
        Integer userId = null;
        String classCode = null;

        try {
            if (requestBody.containsKey("userId")) {
                userId = Integer.valueOf(requestBody.get("userId").toString());
            }
            if (requestBody.containsKey("classCode")) {
                classCode = requestBody.get("classCode").toString();
            }
        } catch (NumberFormatException e) {
            response.put("error", "Invalid user ID format");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Validate required parameters
        if (userId == null) {
            response.put("error", "User ID is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        if (classCode == null || classCode.trim().isEmpty()) {
            response.put("error", "Class code is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            EnrollmentEntity enrollment = enrollmentService.enrollStudent(userId, classCode);
            response.put("message", "Successfully enrolled");
            response.put("enrollment", enrollment);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Gets all enrollments for a user
     *
     * @param userId the ID of the user
     * @return ResponseEntity with list of enrollments
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getEnrollmentsByUser(@PathVariable Integer userId) {
        try {
            List<EnrollmentEntity> enrollments = enrollmentService.getEnrollmentsByStudent(userId);
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