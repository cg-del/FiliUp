package edu.cit.filiup.service;

import edu.cit.filiup.dto.StudentProfileDTO;
import java.util.UUID;

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
} 