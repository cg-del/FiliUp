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
} 