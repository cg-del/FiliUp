package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.StudentProfileDTO;
import edu.cit.filiup.entity.StudentProfileEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.StudentProfileRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.StudentProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @Autowired
    public StudentProfileServiceImpl(StudentProfileRepository studentProfileRepository,
                                   UserRepository userRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public StudentProfileDTO createProfile(StudentProfileDTO profileDTO) {
        if (studentProfileRepository.existsByUserUserId(profileDTO.getUserId())) {
            throw new IllegalStateException("Profile already exists for user: " + profileDTO.getUserId());
        }

        UserEntity user = userRepository.findById(profileDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + profileDTO.getUserId()));

        StudentProfileEntity profile = new StudentProfileEntity();
        updateProfileFromDTO(profile, profileDTO, user);
        StudentProfileEntity savedProfile = studentProfileRepository.save(profile);
        return convertToDTO(savedProfile);
    }

    @Override
    public StudentProfileDTO getProfileById(UUID profileId) {
        StudentProfileEntity profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found with id: " + profileId));
        return convertToDTO(profile);
    }

    @Override
    public StudentProfileDTO getProfileByUserId(UUID userId) {
        StudentProfileEntity profile = studentProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
        return convertToDTO(profile);
    }

    @Override
    @Transactional
    public StudentProfileDTO updateProfile(UUID profileId, StudentProfileDTO profileDTO) {
        StudentProfileEntity profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found with id: " + profileId));
        
        UserEntity user = userRepository.findById(profileDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + profileDTO.getUserId()));

        updateProfileFromDTO(profile, profileDTO, user);
        profile.setUpdatedAt(LocalDateTime.now());
        StudentProfileEntity updatedProfile = studentProfileRepository.save(profile);
        return convertToDTO(updatedProfile);
    }

    @Override
    @Transactional
    public void deleteProfile(UUID profileId) {
        StudentProfileEntity profile = studentProfileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found with id: " + profileId));
        profile.setIsActive(false);
        profile.setUpdatedAt(LocalDateTime.now());
        studentProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public void incrementQuizzesTaken(UUID userId, Double quizScore) {
        StudentProfileEntity profile = studentProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
        
        int currentTakes = profile.getNumberOfQuizTakes();
        double currentAverage = profile.getAverageScore();
        
        // Calculate new average
        double newAverage = ((currentAverage * currentTakes) + quizScore) / (currentTakes + 1);
        
        profile.setNumberOfQuizTakes(currentTakes + 1);
        profile.setAverageScore(newAverage);
        profile.setUpdatedAt(LocalDateTime.now());
        studentProfileRepository.save(profile);
    }

    private void updateProfileFromDTO(StudentProfileEntity profile, StudentProfileDTO dto, UserEntity user) {
        profile.setUser(user);
        profile.setParentsEmail(dto.getParentsEmail());
        profile.setSection(dto.getSection());
        profile.setBadges(dto.getBadges());
        profile.setIsAccepted(dto.getIsAccepted());
        profile.setEmailVerified(dto.getEmailVerified());
        
        // Update user's profile picture
        user.setUserProfilePictureUrl(dto.getUserProfilePictureUrl());
        userRepository.save(user);
    }

    private StudentProfileDTO convertToDTO(StudentProfileEntity profile) {
        StudentProfileDTO dto = new StudentProfileDTO();
        dto.setProfileId(profile.getProfileId());
        dto.setUserId(profile.getUser().getUserId());
        dto.setUserName(profile.getUser().getUserName());
        dto.setUserProfilePictureUrl(profile.getUser().getUserProfilePictureUrl());
        dto.setParentsEmail(profile.getParentsEmail());
        dto.setSection(profile.getSection());
        dto.setBadges(profile.getBadges());
        dto.setAverageScore(profile.getAverageScore());
        dto.setNumberOfQuizTakes(profile.getNumberOfQuizTakes());
        dto.setIsAccepted(profile.getIsAccepted());
        dto.setEmailVerified(profile.getEmailVerified());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        dto.setIsActive(profile.getIsActive());
        return dto;
    }
} 