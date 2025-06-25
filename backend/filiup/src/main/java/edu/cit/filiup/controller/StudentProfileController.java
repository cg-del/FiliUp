package edu.cit.filiup.controller;

import edu.cit.filiup.dto.StudentProfileDTO;
import edu.cit.filiup.service.StudentProfileService;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/student-profiles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping("/my-profile")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<StudentProfileDTO> getMyProfile() {
        try {
            JwtAuthenticationToken jwtAuthToken = (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Authentication: " + jwtAuthToken);
            System.out.println("Principal: " + jwtAuthToken.getPrincipal());
            System.out.println("Authorities: " + jwtAuthToken.getAuthorities());
            
            String userEmail = jwtAuthToken.getToken().getClaim("sub");
            System.out.println("User email from token: " + userEmail);
            
            // Find user by email
            UserEntity user = userRepository.findByUserEmail(userEmail);
            if (user == null) {
                System.out.println("User not found for email: " + userEmail);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            
            System.out.println("Found user: " + user.getUserName() + ", ID: " + user.getUserId() + ", Role: " + user.getUserRole());
            
            try {
                // Get profile by user ID - wrap this in a try-catch to handle the case where profile doesn't exist
                StudentProfileDTO profile = studentProfileService.getProfileByUserId(user.getUserId());
                return ResponseEntity.ok(profile);
            } catch (Exception e) {
                // If profile doesn't exist, return 404
                System.out.println("Profile not found for user ID: " + user.getUserId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            System.err.println("Error in getMyProfile: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<StudentProfileDTO> createProfile(@RequestBody StudentProfileDTO profileDTO) {
        StudentProfileDTO createdProfile = studentProfileService.createProfile(profileDTO);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @GetMapping("/{profileId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<StudentProfileDTO> getProfileById(@PathVariable UUID profileId) {
        StudentProfileDTO profile = studentProfileService.getProfileById(profileId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<StudentProfileDTO> getProfileByUserId(@PathVariable UUID userId) {
        StudentProfileDTO profile = studentProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{profileId}")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<StudentProfileDTO> updateProfile(
            @PathVariable UUID profileId,
            @RequestBody StudentProfileDTO profileDTO) {
        StudentProfileDTO updatedProfile = studentProfileService.updateProfile(profileId, profileDTO);
        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping("/{profileId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'ADMIN')")
    public ResponseEntity<Void> deleteProfile(@PathVariable UUID profileId) {
        studentProfileService.deleteProfile(profileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/increment-quizzes-taken/{userId}")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<Void> incrementQuizzesTaken(
            @PathVariable UUID userId,
            @RequestParam Double quizScore) {
        studentProfileService.incrementQuizzesTaken(userId, quizScore);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/increment-classes-managed/{userId}")
    @PreAuthorize("hasAuthority('TEACHER')")
    public ResponseEntity<Void> incrementClassesManaged(@PathVariable UUID userId) {
        studentProfileService.incrementClassesManaged(userId);
        return ResponseEntity.ok().build();
    }

    // Get comprehensive dashboard statistics for a student
    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<Map<String, Object>> getStudentDashboardStats(JwtAuthenticationToken jwtAuthToken) {
        try {
            // Extract user email/username from token
            String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
            
            // Find user in database - try email first, then username
            UserEntity user = userRepository.findByUserEmail(userIdentifier);
            if (user == null) {
                user = userRepository.findByUserName(userIdentifier);
            }
            
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            Map<String, Object> stats = studentProfileService.getStudentDashboardStats(user.getUserId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 