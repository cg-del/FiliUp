package edu.cit.filiup.controller;

import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.repository.EnrollmentRepository;
import edu.cit.filiup.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollment-status")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class EnrollmentStatusController {
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    /**
     * Get the enrollment status for a student
     * @param studentId UUID of the student
     * @return status: 'pending', 'approved', 'rejected', or 'none'
     */
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getEnrollmentStatus(@PathVariable UUID studentId) {
        try {
            List<EnrollmentEntity> enrollments = enrollmentRepository.findByUserId(studentId);
            if (enrollments == null || enrollments.isEmpty()) {
                Map<String, String> result = new HashMap<>();
                result.put("status", "none");
                return ResponseUtil.success("No enrollment found", result);
            }
            // Find the latest by enrollmentDate
            EnrollmentEntity latest = enrollments.get(0);
            for (EnrollmentEntity e : enrollments) {
                if (e.getEnrollmentDate() != null && (latest.getEnrollmentDate() == null || e.getEnrollmentDate().isAfter(latest.getEnrollmentDate()))) {
                    latest = e;
                }
            }
            String status;
            if (Boolean.TRUE.equals(latest.getIsAccepted())) {
                status = "approved";
            } else {
                status = "pending";
            }
            Map<String, String> result = new HashMap<>();
            result.put("status", status);
            result.put("classCode", latest.getClassCode() != null ? latest.getClassCode() : "");
            return ResponseUtil.success("Enrollment status found", result);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to get enrollment status: " + e.getMessage());
        }
    }
}
