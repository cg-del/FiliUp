package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.EnrollmentResponseDTO;
import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.StudentProfileEntity;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.repository.EnrollmentRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.StudentProfileRepository;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.service.EnrollmentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ClassRepository classRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public EnrollmentServiceImpl(
            EnrollmentRepository enrollmentRepository,
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            ClassRepository classRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.classRepository = classRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public EnrollmentEntity enrollStudent(UUID studentId, String classCode) {
        // Verify student exists and is a student
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        if (!"STUDENT".equals(student.getUserRole())) {
            throw new IllegalStateException("Only students can enroll in classes");
        }

        // Verify the class exists
        ClassEntity classEntity = classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new EntityNotFoundException("Class not found with code: " + classCode));

        // Check if the user is already enrolled
        if (enrollmentRepository.existsByUserIdAndClassCode(studentId, classCode)) {
            throw new IllegalStateException("You are already enrolled in this class");
        }

        // Create new enrollment - student profile is no longer required
        EnrollmentEntity enrollment = new EnrollmentEntity();
        enrollment.setUserId(studentId);
        enrollment.setClassCode(classCode);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setIsAccepted(false); // Teacher needs to accept the enrollment

        EnrollmentEntity savedEnrollment = enrollmentRepository.save(enrollment);

        // Send WebSocket notification to the teacher
        sendEnrollmentNotificationToTeacher(savedEnrollment, classEntity);

        return savedEnrollment;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentEntity> getEnrollmentsByStudent(UUID studentId) {
        return enrollmentRepository.findByUserId(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> getEnrollmentsByClassCode(String classCode) {
        return enrollmentRepository.findByClassCode(classCode)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponseDTO> getPendingEnrollmentsByClassId(UUID classId) {
        // First get the class to find its class code
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found with ID: " + classId));
        
        // Get all enrollments for this class that are not accepted (pending)
        return enrollmentRepository.findByClassCodeAndIsAccepted(classEntity.getClassCode(), false)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void acceptStudent(UUID studentId, String classCode) {
        EnrollmentEntity enrollment = enrollmentRepository.findByClassCodeAndUserId(classCode, studentId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found"));
        
        enrollment.setIsAccepted(true);
        EnrollmentEntity savedEnrollment = enrollmentRepository.save(enrollment);

        // Get class information for notification
        ClassEntity classEntity = classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new EntityNotFoundException("Class not found with code: " + classCode));

        // Send WebSocket notification to the student about acceptance
        sendAcceptanceNotificationToStudent(savedEnrollment, classEntity);
    }

    @Override
    @Transactional
    public void acceptMultipleStudents(List<UUID> studentIds, String classCode) {
        studentIds.forEach(studentId -> acceptStudent(studentId, classCode));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(UUID userId, String classCode) {
        // Verify the user exists and is a student
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!"STUDENT".equals(user.getUserRole())) {
            throw new IllegalStateException("Only students can be enrolled in classes");
        }

        return enrollmentRepository.existsByUserIdAndClassCode(userId, classCode);
    }

    private EnrollmentResponseDTO convertToResponseDTO(EnrollmentEntity enrollment) {
        EnrollmentResponseDTO dto = new EnrollmentResponseDTO();
        dto.setId(enrollment.getId());
        dto.setUserId(enrollment.getUserId());
        dto.setClassCode(enrollment.getClassCode());
        dto.setIsAccepted(enrollment.getIsAccepted());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());

        // Get user information
        UserEntity user = userRepository.findById(enrollment.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        dto.setStudentName(user.getUserName());
        dto.setStudentEmail(user.getUserEmail());
        dto.setUserProfilePictureUrl(user.getUserProfilePictureUrl());

        // Get student profile information if it exists, otherwise use default values
        StudentProfileEntity profile = studentProfileRepository.findByUserUserId(enrollment.getUserId())
                .orElse(null);
        
        if (profile != null) {
            dto.setSection(profile.getSection());
            dto.setAverageScore(profile.getAverageScore());
            dto.setNumberOfQuizTakes(profile.getNumberOfQuizTakes());
        } else {
            // Use default values when profile doesn't exist
            dto.setSection("Not specified");
            dto.setAverageScore(0.0);
            dto.setNumberOfQuizTakes(0);
        }

        return dto;
    }

    /**
     * Sends a real-time notification to the teacher when a new enrollment request is received
     */
    private void sendEnrollmentNotificationToTeacher(EnrollmentEntity enrollment, ClassEntity classEntity) {
        try {
            // Get student information
            UserEntity student = userRepository.findById(enrollment.getUserId())
                    .orElse(null);
            
            if (student == null) {
                return;
            }

            // Create enrollment DTO for the notification
            EnrollmentResponseDTO enrollmentDTO = convertToResponseDTO(enrollment);

            // Create WebSocket message
            Map<String, Object> message = new HashMap<>();
            message.put("type", "NEW_ENROLLMENT");
            message.put("classId", classEntity.getClassId().toString());
            message.put("classCode", classEntity.getClassCode());
            message.put("enrollment", enrollmentDTO);
            message.put("message", student.getUserName() + " has requested to join your class: " + classEntity.getClassName());

            // Send to teacher via WebSocket
            messagingTemplate.convertAndSendToUser(
                classEntity.getTeacher().getUserId().toString(),
                "/queue/enrollment",
                message
            );

            System.out.println("Sent enrollment notification to teacher " + classEntity.getTeacher().getUserId() + 
                             " for class " + classEntity.getClassName());

        } catch (Exception e) {
            System.err.println("Failed to send enrollment notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Sends a real-time notification to the student when their enrollment is accepted
     */
    private void sendAcceptanceNotificationToStudent(EnrollmentEntity enrollment, ClassEntity classEntity) {
        try {
            // Create WebSocket message
            Map<String, Object> message = new HashMap<>();
            message.put("type", "ENROLLMENT_ACCEPTED");
            message.put("classId", classEntity.getClassId().toString());
            message.put("classCode", classEntity.getClassCode());
            message.put("className", classEntity.getClassName());
            message.put("message", "Your enrollment request for " + classEntity.getClassName() + " has been accepted!");

            // Send to student via WebSocket
            messagingTemplate.convertAndSendToUser(
                enrollment.getUserId().toString(),
                "/queue/enrollment",
                message
            );

            System.out.println("Sent acceptance notification to student " + enrollment.getUserId() + 
                             " for class " + classEntity.getClassName());

        } catch (Exception e) {
            System.err.println("Failed to send acceptance notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 