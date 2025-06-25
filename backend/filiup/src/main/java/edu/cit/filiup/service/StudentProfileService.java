package edu.cit.filiup.service;

import edu.cit.filiup.dto.StudentProfileDTO;
import java.util.UUID;
import java.util.Map;

public interface StudentProfileService {
    StudentProfileDTO createProfile(StudentProfileDTO profileDTO);
    StudentProfileDTO getProfileById(UUID profileId);
    StudentProfileDTO getProfileByUserId(UUID userId);
    StudentProfileDTO updateProfile(UUID profileId, StudentProfileDTO profileDTO);
    void deleteProfile(UUID profileId);
    void incrementQuizzesTaken(UUID userId, Double quizScore);
    
    /**
     * Creates a basic student profile if one doesn't exist
     * @param userId the user ID to create a profile for
     * @return the created or existing profile DTO
     */
    StudentProfileDTO createBasicProfileIfNotExists(UUID userId);
    
    /**
     * Increment the number of classes managed (for teacher profiles)
     * @param userId the user ID
     */
    void incrementClassesManaged(UUID userId);
    
    /**
     * Get comprehensive dashboard statistics for a student
     * @param userId the student's user ID
     * @return Map containing dashboard statistics
     */
    Map<String, Object> getStudentDashboardStats(UUID userId);
} 