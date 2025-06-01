package edu.cit.filiup.service;

import edu.cit.filiup.dto.EnrollmentResponseDTO;
import edu.cit.filiup.entity.EnrollmentEntity;
import java.util.List;
import java.util.UUID;

public interface EnrollmentService {
    /**
     * Enrolls a user in a class using the class code
     *
     * @param userId the ID of the user
     * @param classCode the code of the class
     * @return the created enrollment entity
     * @throws RuntimeException if the user or class is not found, or if the user is already enrolled
     */
    EnrollmentEntity enrollStudent(UUID userId, String classCode);

    /**
     * Gets all enrollments for a user
     *
     * @param userId the ID of the user
     * @return list of enrollments
     * @throws RuntimeException if the user is not found
     */
    List<EnrollmentEntity> getEnrollmentsByStudent(UUID userId);

    /**
     * Gets all enrollments for a class
     *
     * @param classCode the code of the class
     * @return list of enrollments with detailed student information
     */
    List<EnrollmentResponseDTO> getEnrollmentsByClassCode(String classCode);

    /**
     * Accepts a student's enrollment request
     *
     * @param studentId the ID of the student to accept
     * @param classCode the code of the class
     */
    void acceptStudent(UUID studentId, String classCode);

    /**
     * Accepts multiple students' enrollment requests
     *
     * @param studentIds list of student IDs to accept
     * @param classCode the code of the class
     */
    void acceptMultipleStudents(List<UUID> studentIds, String classCode);

    /**
     * Checks if a user is enrolled in a class
     *
     * @param userId the ID of the user
     * @param classCode the code of the class
     * @return true if the user is enrolled, false otherwise
     */
    boolean isStudentEnrolled(UUID userId, String classCode);
}