package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.TeacherProfileDTO;
import edu.cit.filiup.entity.TeacherProfileEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.TeacherProfileRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.TeacherProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TeacherProfileServiceImpl implements TeacherProfileService {

    private final TeacherProfileRepository teacherProfileRepository;
    private final UserRepository userRepository;

    @Autowired
    public TeacherProfileServiceImpl(TeacherProfileRepository teacherProfileRepository,
                                   UserRepository userRepository) {
        this.teacherProfileRepository = teacherProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TeacherProfileDTO createProfile(TeacherProfileDTO profileDTO) {
        if (teacherProfileRepository.existsByUserUserId(profileDTO.getUserId())) {
            throw new IllegalStateException("Profile already exists for user: " + profileDTO.getUserId());
        }

        UserEntity user = userRepository.findById(profileDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + profileDTO.getUserId()));

        TeacherProfileEntity profile = new TeacherProfileEntity();
        updateProfileFromDTO(profile, profileDTO, user);
        TeacherProfileEntity savedProfile = teacherProfileRepository.save(profile);
        return convertToDTO(savedProfile);
    }

    @Override
    public TeacherProfileDTO getProfileById(UUID profileId) {
        TeacherProfileEntity profile = teacherProfileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found with id: " + profileId));
        return convertToDTO(profile);
    }

    @Override
    public TeacherProfileDTO getProfileByUserId(UUID userId) {
        TeacherProfileEntity profile = teacherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
        return convertToDTO(profile);
    }

    @Override
    @Transactional
    public TeacherProfileDTO updateProfile(UUID profileId, TeacherProfileDTO profileDTO) {
        TeacherProfileEntity profile = teacherProfileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found with id: " + profileId));
        
        UserEntity user = userRepository.findById(profileDTO.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + profileDTO.getUserId()));

        updateProfileFromDTO(profile, profileDTO, user);
        profile.setUpdatedAt(LocalDateTime.now());
        TeacherProfileEntity updatedProfile = teacherProfileRepository.save(profile);
        return convertToDTO(updatedProfile);
    }

    @Override
    @Transactional
    public void deleteProfile(UUID profileId) {
        TeacherProfileEntity profile = teacherProfileRepository.findById(profileId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found with id: " + profileId));
        profile.setIsActive(false);
        profile.setUpdatedAt(LocalDateTime.now());
        teacherProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public void incrementStoriesCreated(UUID userId) {
        TeacherProfileEntity profile = teacherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
        profile.setTotalStoriesCreated(profile.getTotalStoriesCreated() + 1);
        profile.setUpdatedAt(LocalDateTime.now());
        teacherProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public void incrementQuizzesCreated(UUID userId) {
        TeacherProfileEntity profile = teacherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
        profile.setTotalQuizzesCreated(profile.getTotalQuizzesCreated() + 1);
        profile.setUpdatedAt(LocalDateTime.now());
        teacherProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public void incrementClassesManaged(UUID userId) {
        TeacherProfileEntity profile = teacherProfileRepository.findByUserUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
        profile.setTotalClassesManaged(profile.getTotalClassesManaged() + 1);
        profile.setUpdatedAt(LocalDateTime.now());
        teacherProfileRepository.save(profile);
    }

    private void updateProfileFromDTO(TeacherProfileEntity profile, TeacherProfileDTO dto, UserEntity user) {
        profile.setUser(user);
        profile.setSubjectArea(dto.getSubjectArea());
        profile.setGradeLevelsTaught(dto.getGradeLevelsTaught());
        profile.setTeachingExperienceYears(dto.getTeachingExperienceYears());
        profile.setEducationBackground(dto.getEducationBackground());
        profile.setCertifications(dto.getCertifications());
        profile.setSpecializations(dto.getSpecializations());
    }

    private TeacherProfileDTO convertToDTO(TeacherProfileEntity profile) {
        TeacherProfileDTO dto = new TeacherProfileDTO();
        dto.setProfileId(profile.getProfileId());
        dto.setUserId(profile.getUser().getUserId());
        dto.setUserName(profile.getUser().getUserName());
        dto.setSubjectArea(profile.getSubjectArea());
        dto.setGradeLevelsTaught(profile.getGradeLevelsTaught());
        dto.setTeachingExperienceYears(profile.getTeachingExperienceYears());
        dto.setEducationBackground(profile.getEducationBackground());
        dto.setCertifications(profile.getCertifications());
        dto.setSpecializations(profile.getSpecializations());
        dto.setTotalStoriesCreated(profile.getTotalStoriesCreated());
        dto.setTotalQuizzesCreated(profile.getTotalQuizzesCreated());
        dto.setTotalClassesManaged(profile.getTotalClassesManaged());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        dto.setIsActive(profile.getIsActive());
        return dto;
    }
} 