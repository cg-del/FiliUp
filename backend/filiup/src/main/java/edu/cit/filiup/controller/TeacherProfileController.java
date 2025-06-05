package edu.cit.filiup.controller;

import edu.cit.filiup.dto.TeacherProfileDTO;
import edu.cit.filiup.service.TeacherProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/teacher-profiles")
@CrossOrigin(origins = "*")
public class TeacherProfileController {

    private final TeacherProfileService teacherProfileService;

    @Autowired
    public TeacherProfileController(TeacherProfileService teacherProfileService) {
        this.teacherProfileService = teacherProfileService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TeacherProfileDTO> createProfile(@RequestBody TeacherProfileDTO profileDTO) {
        TeacherProfileDTO createdProfile = teacherProfileService.createProfile(profileDTO);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @GetMapping("/{profileId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<TeacherProfileDTO> getProfileById(@PathVariable UUID profileId) {
        TeacherProfileDTO profile = teacherProfileService.getProfileById(profileId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<TeacherProfileDTO> getProfileByUserId(@PathVariable UUID userId) {
        TeacherProfileDTO profile = teacherProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TeacherProfileDTO> updateProfile(
            @PathVariable UUID profileId,
            @RequestBody TeacherProfileDTO profileDTO) {
        TeacherProfileDTO updatedProfile = teacherProfileService.updateProfile(profileId, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping("/{profileId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID profileId) {
        teacherProfileService.deleteProfile(profileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/increment-stories-created/{userId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> incrementStoriesCreated(@PathVariable UUID userId) {
        teacherProfileService.incrementStoriesCreated(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/increment-quizzes-created/{userId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> incrementQuizzesCreated(@PathVariable UUID userId) {
        teacherProfileService.incrementQuizzesCreated(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/increment-classes-managed/{userId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Void> incrementClassesManaged(@PathVariable UUID userId) {
        teacherProfileService.incrementClassesManaged(userId);
        return ResponseEntity.ok().build();
    }
} 