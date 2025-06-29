package edu.cit.filiup.controller;

import edu.cit.filiup.dto.ClassDetailsDTO;
import edu.cit.filiup.dto.ClassWithStudentCountDto;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.entity.StudentProfileEntity;
import edu.cit.filiup.service.ClassService;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.repository.EnrollmentRepository;
import edu.cit.filiup.repository.StudentProfileRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.util.ResponseUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ClassController {
    private final ClassService classService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    // Create a new class
    @PostMapping
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> createClass(@RequestBody ClassEntity classEntity) {
        try {
            // Get the authenticated teacher
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseUtil.unauthorized("No authentication found");
            }
            
            String userIdentifier = authentication.getName();
            UserEntity teacher = null;
            
            // Try to get user by email first
            teacher = userService.getUserByEmail(userIdentifier);
            if (teacher == null) {
                // Fallback to username
                teacher = userService.getUserByUsername(userIdentifier);
            }
            
            if (teacher == null) {
                return ResponseUtil.unauthorized("Teacher not found");
            }
            
            // Verify the user is a teacher or admin
            if (!"TEACHER".equals(teacher.getUserRole()) && !"ADMIN".equals(teacher.getUserRole())) {
                return ResponseUtil.forbidden("Only teachers and admins can create classes");
            }
            
            ClassEntity createdClass = classService.createClass(classEntity, teacher.getUserId());
            return ResponseUtil.success("Class created successfully", createdClass);
        } catch (RuntimeException e) {
            return ResponseUtil.badRequest("Failed to create class: " + e.getMessage());
        }
    }

    // Get all active classes
    @GetMapping
    public ResponseEntity<?> getAllClasses() {
        try {
            List<ClassEntity> classes = classService.getAllClasses();
            return ResponseUtil.success("Classes retrieved successfully", classes);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve classes: " + e.getMessage());
        }
    }

    // Get class by ID
    @GetMapping("/{classId}")
    public ResponseEntity<?> getClassById(@PathVariable UUID classId) {
        try {
            ClassDetailsDTO classDetails = classService.getClassDetailsById(classId);
            return ResponseUtil.success("Class retrieved successfully", classDetails);
        } catch (EntityNotFoundException e) {
            return ResponseUtil.notFound("Class with ID " + classId + " not found");
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve class: " + e.getMessage());
        }
    }

    // Get classes by teacher
    @GetMapping("/teacher")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> getClassesByTeacher() {
        try {
            // Get the authenticated user (consistent with other methods)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseUtil.unauthorized("No authentication found");
            }
            
            String userIdentifier = authentication.getName();
            UserEntity user = null;
            
            // Try to get user by email first
            user = userService.getUserByEmail(userIdentifier);
            
            if (user == null) {
                // Fallback to username in case the authentication name is username
                user = userService.getUserByUsername(userIdentifier);
            }
            
            if (user == null) {
                return ResponseUtil.unauthorized("User not found");
            }
            
            // Verify the user is a teacher or admin
            if (!"TEACHER".equals(user.getUserRole()) && !"ADMIN".equals(user.getUserRole())) {
                return ResponseUtil.forbidden("Only teachers and admins can access their classes");
            }
            
            List<ClassWithStudentCountDto> classes = classService.getClassesWithStudentCountByTeacher(user.getUserId());
            return ResponseUtil.success("Classes retrieved successfully", classes);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve classes: " + e.getMessage());
        }
    }

    // Get classes for the authenticated student
    @GetMapping("/myclasses")
    @RequireRole("STUDENT")
    public ResponseEntity<?> getMyClasses() {
        try {
            // Get the authenticated user (consistent with other methods)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseUtil.unauthorized("No authentication found");
            }
            
            String userIdentifier = authentication.getName();
            UserEntity user = null;
            
            // Try to get user by email first
            user = userService.getUserByEmail(userIdentifier);
            
            if (user == null) {
                // Fallback to username in case the authentication name is username
                user = userService.getUserByUsername(userIdentifier);
            }
            
            if (user == null) {
                return ResponseUtil.unauthorized("User not found");
            }
            
            // Verify the user is a student
            if (!"STUDENT".equals(user.getUserRole())) {
                return ResponseUtil.forbidden("Only students can access this endpoint");
            }
            
            // Get only accepted classes
            List<ClassEntity> classes = classService.getAcceptedClassesByStudent(user.getUserId());
            return ResponseUtil.success("Classes retrieved successfully", classes);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve classes: " + e.getMessage());
        }
    }

    // Update class
    @PutMapping("/{classId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> updateClass(
            @PathVariable UUID classId,
            @RequestBody ClassEntity updatedClass) {
        try {
            ClassEntity updated = classService.updateClass(classId, updatedClass);
            return ResponseUtil.success("Class updated successfully", updated);
        } catch (RuntimeException e) {
            return ResponseUtil.notFound("Class with ID " + classId + " not found: " + e.getMessage());
        }
    }

    // Update only the class name
    @PutMapping("/{classId}/name")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> updateClassName(
            @PathVariable UUID classId,
            @RequestBody Map<String, String> payload) {
        try {
            String newName = payload.get("className");
            if (newName == null || newName.trim().isEmpty()) {
                return ResponseUtil.badRequest("Class name is required");
            }
            ClassEntity updated = classService.updateClassName(classId, newName);
            return ResponseUtil.success("Class name updated successfully", updated);
        } catch (RuntimeException e) {
            return ResponseUtil.notFound("Class with ID " + classId + " not found: " + e.getMessage());
        }
    }

    // Delete class (hard delete)
    @DeleteMapping("/{classId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> deleteClass(@PathVariable UUID classId) {
        try {
            classService.deleteClass(classId);
            return ResponseUtil.success("Class deleted successfully");
        } catch (RuntimeException e) {
            return ResponseUtil.badRequest("Failed to delete class: " + e.getMessage());
        }
    }

    // Add student to class
    @PostMapping("/{classId}/students/{studentId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> addStudentToClass(
            @PathVariable UUID classId,
            @PathVariable UUID studentId) {
        try {
            ClassEntity updatedClass = classService.addStudentToClass(classId, studentId);
            return ResponseUtil.success("Student added to class successfully", updatedClass);
        } catch (RuntimeException e) {
            return ResponseUtil.badRequest("Failed to add student to class: " + e.getMessage());
        }
    }

    // Remove student from class
    @DeleteMapping("/{classId}/students/{studentId}")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> removeStudentFromClass(
            @PathVariable UUID classId,
            @PathVariable UUID studentId) {
        try {
            ClassEntity updatedClass = classService.removeStudentFromClass(classId, studentId);
            return ResponseUtil.success("Student removed from class successfully", updatedClass);
        } catch (RuntimeException e) {
            return ResponseUtil.badRequest("Failed to remove student from class: " + e.getMessage());
        }
    }

    @PostMapping("/{classId}/regenerate-code")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> regenerateClassCode(@PathVariable UUID classId) {
        try {
            ClassEntity updatedClass = classService.regenerateClassCode(classId);
            return ResponseUtil.success("Class code regenerated successfully", updatedClass);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to regenerate class code: " + e.getMessage());
        }
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<?> getStudentsByClass(@PathVariable UUID classId) {
        try {
            // First get the class to find its class code
            Optional<ClassEntity> classOptional = classService.getClassById(classId);
            if (!classOptional.isPresent()) {
                return ResponseUtil.notFound("Class with ID " + classId + " not found");
            }
            
            ClassEntity classEntity = classOptional.get();
            String classCode = classEntity.getClassCode();
            
            // Get all accepted enrollments for this class
            List<EnrollmentEntity> acceptedEnrollments = enrollmentRepository.findByClassCodeAndIsAccepted(classCode, true);
            
            // Convert enrollments to student information
            List<Map<String, Object>> studentsList = new ArrayList<>();
            
            for (EnrollmentEntity enrollment : acceptedEnrollments) {
                UserEntity student = userRepository.findById(enrollment.getUserId()).orElse(null);
                if (student != null && "STUDENT".equals(student.getUserRole())) {
                    Map<String, Object> studentInfo = new HashMap<>();
                    studentInfo.put("id", student.getUserId());
                    
                    // User information
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", student.getUserId());
                    userInfo.put("username", student.getUserName());
                    userInfo.put("email", student.getUserEmail());
                    userInfo.put("role", student.getUserRole());
                    studentInfo.put("user", userInfo);
                    
                    // Try to get student profile if it exists
                    try {
                        StudentProfileEntity profile = studentProfileRepository.findByUserUserId(student.getUserId()).orElse(null);
                        if (profile != null) {
                            Map<String, Object> profileInfo = new HashMap<>();
                            profileInfo.put("id", profile.getProfileId());
                            profileInfo.put("userId", profile.getUser().getUserId());
                            profileInfo.put("grade", profile.getSection() != null ? profile.getSection() : "Not specified");
                            profileInfo.put("readingLevel", "Beginner"); // Default reading level
                            studentInfo.put("studentProfile", profileInfo);
                        }
                    } catch (Exception e) {
                        // Profile not found, continue without it
                    }
                    
                    studentsList.add(studentInfo);
                }
            }
            
            return ResponseUtil.success("Students retrieved successfully", studentsList);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve students: " + e.getMessage());
        }
    }

    @GetMapping("/{classId}/teacher")
    public ResponseEntity<?> getClassTeacher(@PathVariable UUID classId) {
        try {
            Map<String, String> teacherInfo = classService.getClassTeacher(classId);
            return ResponseUtil.success("Teacher information retrieved successfully", teacherInfo);
        } catch (Exception e) {
            return ResponseUtil.notFound("Teacher for class ID " + classId + " not found: " + e.getMessage());
        }
    }

    @PostMapping("/{classCode}/enrollments/{studentId}/accept")
    @RequireRole("TEACHER")
    public ResponseEntity<?> acceptEnrollment(
            @PathVariable String classCode,
            @PathVariable UUID studentId) {
        try {
            // Get the authenticated teacher
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            UserEntity teacher = userService.getUserByEmail(userEmail);
            
            if (teacher == null) {
                return ResponseUtil.unauthorized("User not authenticated");
            }
            
            // Verify the user is a teacher
            if (!"TEACHER".equals(teacher.getUserRole())) {
                return ResponseUtil.forbidden("Only teachers can accept enrollments");
            }
            
            classService.acceptEnrollment(classCode, studentId, teacher.getUserId());
            return ResponseUtil.success("Enrollment accepted successfully");
        } catch (AccessDeniedException e) {
            return ResponseUtil.forbidden(e.getMessage());
        } catch (EntityNotFoundException e) {
            return ResponseUtil.notFound(e.getMessage());
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to accept enrollment: " + e.getMessage());
        }
    }

    // Get class dashboard statistics
    @GetMapping("/{classId}/dashboard-stats")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> getClassDashboardStats(@PathVariable UUID classId) {
        try {
            // Get the authenticated user to verify ownership
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdentifier = authentication.getName();
            UserEntity user = userService.getUserByEmail(userIdentifier);
            if (user == null) {
                user = userService.getUserByUsername(userIdentifier);
            }
            if (user == null) {
                return ResponseUtil.unauthorized("User not found");
            }

            Map<String, Object> stats = classService.getClassDashboardStats(classId, user.getUserId());
            return ResponseUtil.success("Dashboard stats retrieved successfully", stats);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve dashboard stats: " + e.getMessage());
        }
    }
}
