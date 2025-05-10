package edu.cit.filiup.service;

import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.repository.EnrollmentRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassService classService;

    /**
     * Enrolls a user in a class using the class code
     *
     * @param userId the ID of the user
     * @param classCode the code of the class
     * @return the created enrollment entity
     * @throws RuntimeException if the user or class is not found, or if the user is already enrolled
     */
    @Transactional
    public EnrollmentEntity enrollStudent(int userId, String classCode) {
        // Verify the user exists and is a student
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"STUDENT".equals(user.getUserRole())) {
            throw new RuntimeException("Only students can enroll in classes");
        }

        // Verify the class exists
        ClassEntity classEntity = classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found with code: " + classCode));

        // Check if the user is already enrolled
        if (enrollmentRepository.existsByUserIdAndClassCode(userId, classCode)) {
            throw new RuntimeException("User is already enrolled in this class");
        }

        // Create new enrollment
        EnrollmentEntity enrollment = new EnrollmentEntity();
        enrollment.setUserId(userId);
        enrollment.setClassCode(classCode);
        enrollment.setEnrollmentDate(LocalDateTime.now());

        // Save to database
        EnrollmentEntity savedEnrollment = enrollmentRepository.save(enrollment);

        // Add user to class
        classService.addStudentToClass(classEntity.getClassId(), userId);

        return savedEnrollment;
    }

    /**
     * Gets all enrollments for a user
     *
     * @param userId the ID of the user
     * @return list of enrollments
     * @throws RuntimeException if the user is not found
     */
    public List<EnrollmentEntity> getEnrollmentsByStudent(int userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return enrollmentRepository.findByUserId(userId);
    }

    /**
     * Gets all enrollments for a class
     *
     * @param classCode the code of the class
     * @return list of enrollments
     */
    public List<EnrollmentEntity> getEnrollmentsByClass(String classCode) {
        return enrollmentRepository.findByClassCode(classCode);
    }

    /**
     * Checks if a user is enrolled in a class
     *
     * @param userId the ID of the user
     * @param classCode the code of the class
     * @return true if the user is enrolled, false otherwise
     * @throws RuntimeException if the user is not found
     */
    public boolean isStudentEnrolled(int userId, String classCode) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return enrollmentRepository.existsByUserIdAndClassCode(userId, classCode);
    }
}