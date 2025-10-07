package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.section.CreateSectionRequest;
import com.filiup.Filiup.dto.section.SectionResponse;
import com.filiup.Filiup.dto.teacher.SectionLeaderboardResponse;
import com.filiup.Filiup.dto.teacher.TeacherDashboardResponse;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.repository.UserRepository;
import com.filiup.Filiup.service.SectionService;
import com.filiup.Filiup.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final SectionService sectionService;
    private final TeacherService teacherService;
    private final UserRepository userRepository;

    @GetMapping("/sections")
    public ResponseEntity<List<SectionResponse>> getSections(Authentication authentication) {
        UUID teacherId = extractTeacherId(authentication);
        return ResponseEntity.ok(sectionService.getTeacherSections(teacherId));
    }

    @PostMapping("/sections")
    public ResponseEntity<SectionResponse> createSection(
            @Valid @RequestBody CreateSectionRequest request,
            Authentication authentication) {
        UUID teacherId = extractTeacherId(authentication);
        return ResponseEntity.ok(sectionService.createSection(request, teacherId));
    }

    @GetMapping("/sections/{id}")
    public ResponseEntity<SectionResponse> getSectionDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(sectionService.getSectionById(id));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TeacherDashboardResponse> getDashboard(Authentication authentication) {
        UUID teacherId = extractTeacherId(authentication);
        return ResponseEntity.ok(teacherService.getDashboard(teacherId));
    }

    @GetMapping("/sections/{sectionId}/leaderboard")
    public ResponseEntity<SectionLeaderboardResponse> getSectionLeaderboard(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(teacherService.getSectionLeaderboard(sectionId));
    }

    @GetMapping("/leaderboard/all-sections")
    public ResponseEntity<List<SectionLeaderboardResponse>> getAllSectionsLeaderboard(Authentication authentication) {
        UUID teacherId = extractTeacherId(authentication);
        return ResponseEntity.ok(teacherService.getAllSectionsLeaderboard(teacherId));
    }

    private UUID extractTeacherId(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
