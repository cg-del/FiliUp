package edu.cit.filiup.controller;

import edu.cit.filiup.dto.StudentProfileDTO;
import edu.cit.filiup.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student-profiles")
@CrossOrigin(origins = "*")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @Autowired
    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDTO> createProfile(@RequestBody StudentProfileDTO profileDTO) {
        StudentProfileDTO createdProfile = studentProfileService.createProfile(profileDTO);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @GetMapping("/{profileId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<StudentProfileDTO> getProfileById(@PathVariable UUID profileId) {
        StudentProfileDTO profile = studentProfileService.getProfileById(profileId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<StudentProfileDTO> getProfileByUserId(@PathVariable UUID userId) {
        StudentProfileDTO profile = studentProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentProfileDTO> updateProfile(
            @PathVariable UUID profileId,
            @RequestBody StudentProfileDTO profileDTO) {
        StudentProfileDTO updatedProfile = studentProfileService.updateProfile(profileId, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping("/{profileId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID profileId) {
        studentProfileService.deleteProfile(profileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/increment-quizzes-taken/{userId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> incrementQuizzesTaken(
            @PathVariable UUID userId,
            @RequestParam Double quizScore) {
        studentProfileService.incrementQuizzesTaken(userId, quizScore);
        return ResponseEntity.ok().build();
    }
} 