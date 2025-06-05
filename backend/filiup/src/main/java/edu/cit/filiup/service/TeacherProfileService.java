package edu.cit.filiup.service;

import edu.cit.filiup.dto.TeacherProfileDTO;
import java.util.UUID;

public interface TeacherProfileService {
    TeacherProfileDTO createProfile(TeacherProfileDTO profileDTO);
    TeacherProfileDTO getProfileById(UUID profileId);
    TeacherProfileDTO getProfileByUserId(UUID userId);
    TeacherProfileDTO updateProfile(UUID profileId, TeacherProfileDTO profileDTO);
    void deleteProfile(UUID profileId);
    void incrementStoriesCreated(UUID userId);
    void incrementQuizzesCreated(UUID userId);
    void incrementClassesManaged(UUID userId);
} 