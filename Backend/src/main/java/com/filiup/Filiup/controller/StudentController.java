package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.activity.ActivityContentResponse;
import com.filiup.Filiup.dto.dashboard.StudentDashboardResponse;
import com.filiup.Filiup.dto.lesson.LessonContentResponse;
import com.filiup.Filiup.dto.student.ActivitySubmissionResponse;
import com.filiup.Filiup.dto.student.ProfileResponse;
import com.filiup.Filiup.dto.student.RegisterSectionRequest;
import com.filiup.Filiup.dto.student.SubmitActivityRequest;
import com.filiup.Filiup.dto.teacher.SectionLeaderboardResponse;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.repository.UserRepository;
import com.filiup.Filiup.service.ActivityContentService;
import com.filiup.Filiup.service.LessonContentService;
import com.filiup.Filiup.service.LessonService;
import com.filiup.Filiup.service.StudentDashboardService;
import com.filiup.Filiup.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final LessonService lessonService;
    private final StudentDashboardService studentDashboardService;
    private final LessonContentService lessonContentService;
    private final ActivityContentService activityContentService;
    private final UserRepository userRepository;

    @PostMapping("/register-section")
    public ResponseEntity<Map<String, String>> registerSection(
            @Valid @RequestBody RegisterSectionRequest request,
            Authentication authentication) {
        
        UUID studentId = extractStudentId(authentication);
        studentService.registerToSection(studentId, request);
        
        return ResponseEntity.ok(Map.of("message", "Successfully registered to section"));
    }

    @GetMapping("/lessons")
    public ResponseEntity<List<Map<String, Object>>> getLessons(Authentication authentication) {
        UUID studentId = extractStudentId(authentication);
        return ResponseEntity.ok(lessonService.getLessonsWithProgress(studentId));
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<Map<String, Object>> getLessonContent(@PathVariable UUID id) {
        return ResponseEntity.ok(lessonService.getLessonContent(id));
    }

    @PostMapping("/lessons/{id}/complete")
    public ResponseEntity<Map<String, String>> completeLesson(
            @PathVariable UUID id,
            Authentication authentication) {
        
        UUID studentId = extractStudentId(authentication);
        studentService.completeLessonReading(studentId, id);
        
        return ResponseEntity.ok(Map.of("message", "Lesson marked as completed"));
    }

    @GetMapping("/activities/{id}")
    public ResponseEntity<Map<String, Object>> getActivity(@PathVariable UUID id) {
        return ResponseEntity.ok(lessonService.getActivityContent(id));
    }

    @PostMapping("/activities/{id}/submit")
    public ResponseEntity<ActivitySubmissionResponse> submitActivity(
            @PathVariable UUID id,
            @Valid @RequestBody SubmitActivityRequest request,
            Authentication authentication) {
        
        UUID studentId = extractStudentId(authentication);
        return ResponseEntity.ok(studentService.submitActivity(studentId, id, request));
    }

    // New endpoints for StudentDashboard
    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard(Authentication authentication) {
        UUID studentId = extractStudentId(authentication);
        return ResponseEntity.ok(studentDashboardService.getStudentDashboard(studentId));
    }

    @GetMapping("/lessons/{id}/content")
    public ResponseEntity<LessonContentResponse> getLessonContentStructured(@PathVariable UUID id) {
        return ResponseEntity.ok(lessonContentService.getLessonContent(id));
    }

    @GetMapping("/activities/{id}/content")
    public ResponseEntity<ActivityContentResponse> getActivityContentStructured(@PathVariable UUID id) {
        return ResponseEntity.ok(activityContentService.getActivityContent(id));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<SectionLeaderboardResponse> getLeaderboard(Authentication authentication) {
        UUID studentId = extractStudentId(authentication);
        return ResponseEntity.ok(studentService.getStudentSectionLeaderboard(studentId));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getStudentProfile(Authentication authentication) {
        UUID studentId = extractStudentId(authentication);
        return ResponseEntity.ok(studentService.getStudentProfile(studentId));
    }

    private UUID extractStudentId(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
