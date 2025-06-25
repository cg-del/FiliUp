package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.StudentProfileDTO;
import edu.cit.filiup.entity.StudentProfileEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.QuizAttemptEntity;
import edu.cit.filiup.entity.ProgressEntity;
import edu.cit.filiup.entity.LeaderboardEntity;
import edu.cit.filiup.repository.StudentProfileRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.EnrollmentRepository;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.repository.QuizAttemptRepository;
import edu.cit.filiup.repository.ProgressRepository;
import edu.cit.filiup.repository.LeaderboardRepository;
import edu.cit.filiup.repository.StoryRepository;
import edu.cit.filiup.service.StudentProfileService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClassRepository classRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ProgressRepository progressRepository;
    private final LeaderboardRepository leaderboardRepository;
    private final StoryRepository storyRepository;

    @Autowired
    public StudentProfileServiceImpl(StudentProfileRepository studentProfileRepository,
                                   UserRepository userRepository,
                                   EnrollmentRepository enrollmentRepository,
                                   ClassRepository classRepository,
                                   QuizAttemptRepository quizAttemptRepository,
                                   ProgressRepository progressRepository,
                                   LeaderboardRepository leaderboardRepository,
                                   StoryRepository storyRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.classRepository = classRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.progressRepository = progressRepository;
        this.leaderboardRepository = leaderboardRepository;
        this.storyRepository = storyRepository;
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
        // Try to find existing profile, create one if it doesn't exist
        StudentProfileEntity profile = studentProfileRepository.findByUserUserId(userId)
                .orElse(null);
        
        if (profile == null) {
            // Create a basic profile for the student
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
            
            profile = new StudentProfileEntity();
            profile.setUser(user);
            // Default values are set in the constructor
            profile = studentProfileRepository.save(profile);
        }
        
        int currentTakes = profile.getNumberOfQuizTakes();
        double currentAverage = profile.getAverageScore();
        
        // Calculate new average
        double newAverage = ((currentAverage * currentTakes) + quizScore) / (currentTakes + 1);
        
        profile.setNumberOfQuizTakes(currentTakes + 1);
        profile.setAverageScore(newAverage);
        profile.setUpdatedAt(LocalDateTime.now());
        studentProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public StudentProfileDTO createBasicProfileIfNotExists(UUID userId) {
        // Check if profile already exists
        if (studentProfileRepository.existsByUserUserId(userId)) {
            // Return existing profile
            StudentProfileEntity existingProfile = studentProfileRepository.findByUserUserId(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Profile not found for user id: " + userId));
            return convertToDTO(existingProfile);
        }

        // Create a new basic profile
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (!"STUDENT".equals(user.getUserRole())) {
            throw new IllegalStateException("Can only create student profiles for users with STUDENT role");
        }

        StudentProfileEntity profile = new StudentProfileEntity();
        profile.setUser(user);
        // Default values are set in the constructor
        // emailVerified is false by default, which is appropriate for auto-created profiles
        
        StudentProfileEntity savedProfile = studentProfileRepository.save(profile);
        return convertToDTO(savedProfile);
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

    @Override
    @Transactional
    public void incrementClassesManaged(UUID userId) {
        // This method is typically for teacher profiles, but we'll implement it here for compatibility
        // In a real system, this might be moved to a separate TeacherProfileService
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        
        // For now, this is a no-op since we don't have a classes managed field in student profiles
        // In a real implementation, you might want to create a separate teacher profile entity
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboardStats(UUID userId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Verify user exists and is a student
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
            
            if (!"STUDENT".equals(user.getUserRole())) {
                throw new IllegalArgumentException("Dashboard stats are only available for students");
            }
            
            // Get student's enrolled classes
            List<EnrollmentEntity> enrollments = enrollmentRepository.findByUserIdAndIsAcceptedTrue(userId);
            List<String> classCodes = enrollments.stream()
                    .map(EnrollmentEntity::getClassCode)
                    .collect(Collectors.toList());
            
            List<ClassEntity> enrolledClasses = classRepository.findByClassCodeInAndIsActiveTrue(classCodes);
            
            // Get completed quiz attempts first for calculations
            List<QuizAttemptEntity> completedQuizzes = quizAttemptRepository.findCompletedAttemptsByStudent(userId, null);
            int completedQuizzesCount = completedQuizzes.size();
            
            // Calculate total points from quiz scores if no leaderboard entry exists
            List<LeaderboardEntity> leaderboardEntries = leaderboardRepository.findByStudentUserId(userId);
            int totalPoints = leaderboardEntries.stream()
                    .mapToInt(LeaderboardEntity::getScore)
                    .max()
                    .orElse(0);
            
            // If no leaderboard points, calculate from quiz scores
            if (totalPoints == 0 && !completedQuizzes.isEmpty()) {
                totalPoints = completedQuizzes.stream()
                        .mapToInt(quiz -> quiz.getScore() != null ? quiz.getScore().intValue() : 0)
                        .sum();
            }
            
            // Calculate total available stories and quizzes across all enrolled classes
            int totalStoriesAvailable = 0;
            int totalQuizzesAvailable = 0;
            
            for (ClassEntity classEntity : enrolledClasses) {
                totalStoriesAvailable += classEntity.getStories().size();
                // For now, assume each story has at least one quiz
                // In the future, you might want to add a relationship between stories and quizzes
                totalQuizzesAvailable += classEntity.getStories().size();
            }
            
            // Count completed stories based on quiz attempts
            // A story is considered completed if the student has completed at least one quiz for it
            long completedStories = completedQuizzes.stream()
                    .filter(quiz -> quiz.getQuiz() != null && quiz.getQuiz().getStory() != null)
                    .map(quiz -> quiz.getQuiz().getStory().getStoryId())
                    .distinct()
                    .count();
            
            // Calculate level based on points (improved formula)
            int level = Math.max(1, (totalPoints / 100) + 1);
            
            // Calculate average quiz score
            double averageQuizScore = completedQuizzes.stream()
                    .filter(quiz -> quiz.getMaxPossibleScore() > 0)
                    .mapToDouble(quiz -> (double) quiz.getScore() / quiz.getMaxPossibleScore() * 100)
                    .average()
                    .orElse(0.0);
            
            // Get student profile for additional stats
            StudentProfileEntity profile = studentProfileRepository.findByUserUserId(userId).orElse(null);
            double profileAverageScore = profile != null ? profile.getAverageScore() : 0.0;
            int profileQuizTakes = profile != null ? profile.getNumberOfQuizTakes() : 0;
            
            // Build response
            stats.put("userId", userId);
            stats.put("userName", user.getUserName());
            stats.put("totalPoints", totalPoints);
            stats.put("completedStories", (int) completedStories);
            stats.put("totalStories", totalStoriesAvailable);
            stats.put("completedQuizzes", completedQuizzesCount);
            stats.put("totalQuizzes", totalQuizzesAvailable);
            stats.put("level", level);
            stats.put("averageQuizScore", Math.round(averageQuizScore * 100.0) / 100.0);
            stats.put("profileAverageScore", Math.round(profileAverageScore * 100.0) / 100.0);
            stats.put("profileQuizTakes", profileQuizTakes);
            stats.put("enrolledClassesCount", enrolledClasses.size());
            stats.put("lastUpdated", LocalDateTime.now());
            
            // Add recent activity
            List<Map<String, Object>> recentQuizzes = completedQuizzes.stream()
                    .limit(5)
                    .map(quiz -> {
                        Map<String, Object> quizInfo = new HashMap<>();
                        quizInfo.put("quizTitle", quiz.getQuiz().getTitle());
                        quizInfo.put("score", quiz.getScore());
                        quizInfo.put("maxScore", quiz.getMaxPossibleScore());
                        quizInfo.put("percentage", quiz.getMaxPossibleScore() > 0 ? 
                            Math.round((double) quiz.getScore() / quiz.getMaxPossibleScore() * 100) : 0);
                        quizInfo.put("completedAt", quiz.getCompletedAt());
                        return quizInfo;
                    })
                    .collect(Collectors.toList());
            
            stats.put("recentQuizzes", recentQuizzes);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate student dashboard statistics: " + e.getMessage());
        }
        
        return stats;
    }
} 