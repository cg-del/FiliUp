package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.BadgeDTO;
import edu.cit.filiup.dto.StudentBadgeDTO;
import edu.cit.filiup.dto.StudentBadgeStatsDTO;
import edu.cit.filiup.entity.*;
import edu.cit.filiup.repository.*;
import edu.cit.filiup.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final StoryRepository storyRepository;
    private final ClassRepository classRepository;

    @Autowired
    public BadgeServiceImpl(BadgeRepository badgeRepository,
                           StudentBadgeRepository studentBadgeRepository,
                           UserRepository userRepository,
                           QuizAttemptRepository quizAttemptRepository,
                           QuizRepository quizRepository,
                           StoryRepository storyRepository,
                           ClassRepository classRepository) {
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
        this.userRepository = userRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.storyRepository = storyRepository;
        this.classRepository = classRepository;
    }

    @Override
    public BadgeEntity createBadge(BadgeEntity badge, UUID createdByUserId) {
        UserEntity creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"TEACHER".equals(creator.getUserRole()) && !"ADMIN".equals(creator.getUserRole())) {
            throw new RuntimeException("Only teachers and admins can create badges");
        }

        badge.setCreatedBy(creator);
        badge.setIsActive(true);
        return badgeRepository.save(badge);
    }

    @Override
    public List<BadgeEntity> getAllActiveBadges() {
        return badgeRepository.findByIsActiveTrue();
    }

    @Override
    public BadgeEntity getBadgeById(UUID badgeId) {
        return badgeRepository.findById(badgeId)
                .filter(BadgeEntity::getIsActive)
                .orElseThrow(() -> new RuntimeException("Badge not found"));
    }

    @Override
    public BadgeEntity updateBadge(UUID badgeId, BadgeEntity updatedBadge) {
        BadgeEntity existingBadge = getBadgeById(badgeId);
        existingBadge.setTitle(updatedBadge.getTitle());
        existingBadge.setDescription(updatedBadge.getDescription());
        existingBadge.setCriteria(updatedBadge.getCriteria());
        existingBadge.setPointsValue(updatedBadge.getPointsValue());
        existingBadge.setImageUrl(updatedBadge.getImageUrl());
        return badgeRepository.save(existingBadge);
    }

    @Override
    public void deleteBadge(UUID badgeId) {
        BadgeEntity badge = getBadgeById(badgeId);
        badge.setIsActive(false);
        badgeRepository.save(badge);
    }

    @Override
    public StudentBadgeEntity awardBadgeToStudent(UUID studentId, UUID badgeId, Double performanceScore, String notes) {
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!"STUDENT".equals(student.getUserRole())) {
            throw new RuntimeException("Badges can only be awarded to students");
        }

        BadgeEntity badge = getBadgeById(badgeId);

        // Check if student already has this badge
        if (hasStudentEarnedBadge(studentId, badgeId)) {
            throw new RuntimeException("Student already has this badge");
        }

        StudentBadgeEntity studentBadge = new StudentBadgeEntity(student, badge, performanceScore);
        studentBadge.setNotes(notes);
        return studentBadgeRepository.save(studentBadge);
    }

    @Override
    public void revokeBadgeFromStudent(UUID studentId, UUID badgeId) {
        Optional<StudentBadgeEntity> studentBadge = studentBadgeRepository
                .findByStudentUserIdAndBadgeBadgeIdAndIsActiveTrue(studentId, badgeId);
        
        if (studentBadge.isPresent()) {
            StudentBadgeEntity badge = studentBadge.get();
            badge.setIsActive(false);
            studentBadgeRepository.save(badge);
        }
    }

    @Override
    public boolean hasStudentEarnedBadge(UUID studentId, UUID badgeId) {
        return studentBadgeRepository.existsByStudentUserIdAndBadgeBadgeIdAndIsActiveTrue(studentId, badgeId);
    }

    @Override
    public List<BadgeDTO> getStudentBadges(UUID studentId) {
        List<StudentBadgeEntity> studentBadges = studentBadgeRepository.findByStudentUserIdAndIsActiveTrue(studentId);
        List<BadgeEntity> allBadges = getAllActiveBadges();
        
        return allBadges.stream().map(badge -> {
            BadgeDTO dto = convertToBadgeDTO(badge);
            
            // Check if student has earned this badge
            Optional<StudentBadgeEntity> earnedBadge = studentBadges.stream()
                    .filter(sb -> sb.getBadge().getBadgeId().equals(badge.getBadgeId()))
                    .findFirst();
            
            if (earnedBadge.isPresent()) {
                StudentBadgeEntity sb = earnedBadge.get();
                dto.setIsEarned(true);
                dto.setEarnedAt(sb.getEarnedAt());
                dto.setPerformanceScore(sb.getPerformanceScore());
                dto.setNotes(sb.getNotes());
                
                // Set source information if available
                if (sb.getEarnedFromQuizId() != null) {
                    quizRepository.findById(sb.getEarnedFromQuizId())
                            .ifPresent(quiz -> dto.setEarnedFromQuizTitle(quiz.getTitle()));
                }
                if (sb.getEarnedFromStoryId() != null) {
                    storyRepository.findById(sb.getEarnedFromStoryId())
                            .ifPresent(story -> dto.setEarnedFromStoryTitle(story.getTitle()));
                }
                if (sb.getEarnedFromClassId() != null) {
                    classRepository.findById(sb.getEarnedFromClassId())
                            .ifPresent(clazz -> dto.setEarnedFromClassName(clazz.getClassName()));
                }
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public List<StudentBadgeEntity> getEarnedBadges(UUID studentId) {
        return studentBadgeRepository.findByStudentUserIdAndIsActiveTrue(studentId);
    }

    @Override
    public List<StudentBadgeDTO> getEarnedBadgesWithDetails(UUID studentId) {
        List<StudentBadgeEntity> earnedBadges = studentBadgeRepository.findByStudentUserIdAndIsActiveTrue(studentId);
        
        return earnedBadges.stream().map(studentBadge -> {
            StudentBadgeDTO dto = new StudentBadgeDTO();
            dto.setStudentBadgeId(studentBadge.getStudentBadgeId());
            dto.setStudentId(studentBadge.getStudent().getUserId());
            dto.setBadgeId(studentBadge.getBadge().getBadgeId());
            dto.setBadgeEarnedAt(studentBadge.getEarnedAt());
            dto.setPerformanceScore(studentBadge.getPerformanceScore());
            
            // Convert badge entity to DTO
            BadgeDTO badgeDTO = convertToBadgeDTO(studentBadge.getBadge());
            dto.setBadge(badgeDTO);
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public StudentBadgeStatsDTO getStudentBadgeStats(UUID studentId) {
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentBadgeStatsDTO stats = new StudentBadgeStatsDTO(studentId, student.getUserName());
        
        List<StudentBadgeEntity> earnedBadges = studentBadgeRepository.findByStudentUserIdAndIsActiveTrue(studentId);
        List<BadgeEntity> allBadges = getAllActiveBadges();
        
        stats.setTotalBadgesEarned((long) earnedBadges.size());
        stats.setTotalPossibleBadges((long) allBadges.size());
        
        if (!allBadges.isEmpty()) {
            stats.setBadgeCompletionPercentage((double) earnedBadges.size() / allBadges.size() * 100);
        }
        
        if (!earnedBadges.isEmpty()) {
            stats.setLastBadgeEarned(earnedBadges.stream()
                    .map(StudentBadgeEntity::getEarnedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null));
            
            stats.setAveragePerformanceScore(earnedBadges.stream()
                    .filter(sb -> sb.getPerformanceScore() != null)
                    .mapToDouble(StudentBadgeEntity::getPerformanceScore)
                    .average()
                    .orElse(0.0));
        }
        
        // Get recent badges (last 5)
        List<BadgeDTO> recentBadges = earnedBadges.stream()
                .sorted((a, b) -> b.getEarnedAt().compareTo(a.getEarnedAt()))
                .limit(5)
                .map(sb -> {
                    BadgeDTO dto = convertToBadgeDTO(sb.getBadge());
                    dto.setIsEarned(true);
                    dto.setEarnedAt(sb.getEarnedAt());
                    dto.setPerformanceScore(sb.getPerformanceScore());
                    return dto;
                })
                .collect(Collectors.toList());
        
        stats.setRecentBadges(recentBadges);
        stats.setAllBadges(getStudentBadges(studentId));
        
        return stats;
    }

    @Override
    public List<BadgeDTO> getRecentBadgesForStudent(UUID studentId, int limit) {
        List<StudentBadgeEntity> recentBadges = studentBadgeRepository.findRecentBadgesByStudent(studentId);
        
        return recentBadges.stream()
                .limit(limit)
                .map(sb -> {
                    BadgeDTO dto = convertToBadgeDTO(sb.getBadge());
                    dto.setIsEarned(true);
                    dto.setEarnedAt(sb.getEarnedAt());
                    dto.setPerformanceScore(sb.getPerformanceScore());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<BadgeDTO> getBadgesForClass(UUID classId) {
        // This could be enhanced to show class-specific badges or aggregate class badge statistics
        return getAllActiveBadges().stream()
                .map(this::convertToBadgeDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentBadgeStatsDTO> getClassBadgeLeaderboard(UUID classId) {
        // Implementation would require getting all students in the class and their badge stats
        // This is a simplified version - could be enhanced with actual class enrollment logic
        return new ArrayList<>();
    }

    @Override
    public void evaluateAndAwardBadgesForQuizAttempt(QuizAttemptEntity quizAttempt) {
        if (!quizAttempt.getIsCompleted()) {
            return; // Only evaluate completed quiz attempts
        }

        UUID studentId = quizAttempt.getStudent().getUserId();
        double score = quizAttempt.getScore();
        double percentage = (score / quizAttempt.getMaxPossibleScore()) * 100;

        // Award performance-based badges
        awardPerformanceBadgesForQuiz(quizAttempt, percentage);
        
        // Award speed-based badges
        awardSpeedBadgesForQuiz(quizAttempt);
        
        // Award streak badges
        evaluateAndAwardStreakBadges(studentId);
        
        // Award improvement badges
        evaluateAndAwardImprovementBadges(studentId);
    }

    private void awardPerformanceBadgesForQuiz(QuizAttemptEntity quizAttempt, double percentage) {
        UUID studentId = quizAttempt.getStudent().getUserId();
        
        // Perfect Score Badge
        if (percentage >= 100.0) {
            awardBadgeIfNotExists(studentId, "Perpektong Pagsusulit", "Nakakuha ng 100% na marka sa pagsusulit", 
                    percentage, quizAttempt);
        }
        
        // Excellence Badge
        if (percentage >= 95.0) {
            awardBadgeIfNotExists(studentId, "Kahusayan sa Pagsusulit", "Nakakuha ng 95% o mas mataas sa pagsusulit", 
                    percentage, quizAttempt);
        }
        
        // High Achiever Badge
        if (percentage >= 90.0) {
            awardBadgeIfNotExists(studentId, "Mataas na Tagumpay", "Nakakuha ng 90% o mas mataas sa pagsusulit", 
                    percentage, quizAttempt);
        }
        
        // Good Performance Badge
        if (percentage >= 80.0) {
            awardBadgeIfNotExists(studentId, "Magandang Pagganap", "Nakakuha ng 80% o mas mataas sa pagsusulit", 
                    percentage, quizAttempt);
        }
    }

    private void awardSpeedBadgesForQuiz(QuizAttemptEntity quizAttempt) {
        if (quizAttempt.getTimeTakenMinutes() == null) return;
        
        UUID studentId = quizAttempt.getStudent().getUserId();
        int timeTaken = quizAttempt.getTimeTakenMinutes();
        
        // Speed Demon Badge (completed very quickly)
        if (timeTaken <= 5) {
            awardBadgeIfNotExists(studentId, "Mabilis na Dalubhasa", "Nakumpleto ang pagsusulit sa loob ng 5 minuto o mas mababa", 
                    (double) timeTaken, quizAttempt);
        }
        
        // Quick Thinker Badge
        if (timeTaken <= 10) {
            awardBadgeIfNotExists(studentId, "Matalinong Mag-isip", "Nakumpleto ang pagsusulit sa loob ng 10 minuto o mas mababa", 
                    (double) timeTaken, quizAttempt);
        }
    }

    @Override
    public void evaluateAndAwardStreakBadges(UUID studentId) {
        // Get recent quiz attempts
        List<QuizAttemptEntity> recentAttempts = quizAttemptRepository
                .findCompletedAttemptsByStudent(studentId, LocalDateTime.now().minus(30, ChronoUnit.DAYS));
        
        // Calculate current streak of good performances (80%+)
        int currentStreak = calculateCurrentStreak(recentAttempts);
        
        // Award streak badges
        if (currentStreak >= 3) {
            awardBadgeIfNotExists(studentId, "Dalubhasa sa Sunud-sunod", "Nakakuha ng 3 magkasunod na magagandang marka sa pagsusulit", 
                    (double) currentStreak, null);
        }
        
        if (currentStreak >= 5) {
            awardBadgeIfNotExists(studentId, "Kampeon ng Pagkakatuloy", "Nakakuha ng 5 magkasunod na magagandang marka sa pagsusulit", 
                    (double) currentStreak, null);
        }
        
        if (currentStreak >= 10) {
            awardBadgeIfNotExists(studentId, "Hindi Mapipigil", "Nakakuha ng 10 magkasunod na magagandang marka sa pagsusulit", 
                    (double) currentStreak, null);
        }
    }

    @Override
    public void evaluateAndAwardImprovementBadges(UUID studentId) {
        // Get quiz attempts from the last month
        List<QuizAttemptEntity> recentAttempts = quizAttemptRepository
                .findCompletedAttemptsByStudent(studentId, LocalDateTime.now().minus(30, ChronoUnit.DAYS));
        
        if (recentAttempts.size() < 2) return; // Need at least 2 attempts to measure improvement
        
        // Calculate improvement
        double improvementPercentage = calculateImprovementPercentage(recentAttempts);
        
        if (improvementPercentage >= 20.0) {
            awardBadgeIfNotExists(studentId, "Umuusbong na Bituin", "Napabuti ang pagganap sa pagsusulit ng 20% o higit pa", 
                    improvementPercentage, null);
        }
        
        if (improvementPercentage >= 30.0) {
            awardBadgeIfNotExists(studentId, "Dalubhasa sa Pagbabago", "Napabuti ang pagganap sa pagsusulit ng 30% o higit pa", 
                    improvementPercentage, null);
        }
    }

    @Override
    public void evaluateAndAwardPerformanceBadges(UUID studentId) {
        // Get all quiz attempts for this student
        List<QuizAttemptEntity> allAttempts = quizAttemptRepository.findCompletedAttemptsByStudent(studentId, null);
        
        if (allAttempts.isEmpty()) return;
        
        // Calculate overall performance metrics
        double averageScore = allAttempts.stream()
                .mapToDouble(attempt -> (attempt.getScore() / attempt.getMaxPossibleScore()) * 100)
                .average()
                .orElse(0.0);
        
        int totalQuizzes = allAttempts.size();
        
        // Award badges based on overall performance
        if (totalQuizzes >= 10 && averageScore >= 85.0) {
            awardBadgeIfNotExists(studentId, "Nangungunang Tagaganap", "Napanatili ang 85% na average sa 10+ na pagsusulit", 
                    averageScore, null);
        }
        
        if (totalQuizzes >= 5) {
            awardBadgeIfNotExists(studentId, "Beteranong Magsusulit", "Nakumpleto ang 5 o higit pang pagsusulit", 
                    (double) totalQuizzes, null);
        }
        
        if (totalQuizzes >= 20) {
            awardBadgeIfNotExists(studentId, "Dalubhasang Magsusulit", "Nakumpleto ang 20 o higit pang pagsusulit", 
                    (double) totalQuizzes, null);
        }
    }

    @Override
    public void initializeSystemBadges() {
        // Create default system badges if they don't exist
        createSystemBadgeIfNotExists("Perpektong Pagsusulit", "Makakuha ng 100% na marka sa anumang pagsusulit", 
                "Makakuha ng 100% sa isang pagsusulit", 50);
        createSystemBadgeIfNotExists("Kahusayan sa Pagsusulit", "Makakuha ng 95% o mas mataas sa anumang pagsusulit", 
                "Makakuha ng 95% o mas mataas sa isang pagsusulit", 40);
        createSystemBadgeIfNotExists("Mataas na Tagumpay", "Makakuha ng 90% o mas mataas sa anumang pagsusulit", 
                "Makakuha ng 90% o mas mataas sa isang pagsusulit", 30);
        createSystemBadgeIfNotExists("Magandang Pagganap", "Makakuha ng 80% o mas mataas sa anumang pagsusulit", 
                "Makakuha ng 80% o mas mataas sa isang pagsusulit", 20);
        createSystemBadgeIfNotExists("Mabilis na Dalubhasa", "Makumpleto ang pagsusulit sa loob ng 5 minuto o mas mababa", 
                "Makumpleto ang anumang pagsusulit sa loob ng 5 minuto o mas mababa", 35);
        createSystemBadgeIfNotExists("Matalinong Mag-isip", "Makumpleto ang pagsusulit sa loob ng 10 minuto o mas mababa", 
                "Makumpleto ang anumang pagsusulit sa loob ng 10 minuto o mas mababa", 25);
        createSystemBadgeIfNotExists("Dalubhasa sa Sunud-sunod", "Makakuha ng 3 magkasunod na magagandang marka sa pagsusulit", 
                "Makakuha ng 80%+ sa 3 magkasunod na pagsusulit", 45);
        createSystemBadgeIfNotExists("Kampeon ng Pagkakatuloy", "Makakuha ng 5 magkasunod na magagandang marka sa pagsusulit", 
                "Makakuha ng 80%+ sa 5 magkasunod na pagsusulit", 60);
        createSystemBadgeIfNotExists("Hindi Mapipigil", "Makakuha ng 10 magkasunod na magagandang marka sa pagsusulit", 
                "Makakuha ng 80%+ sa 10 magkasunod na pagsusulit", 100);
        createSystemBadgeIfNotExists("Umuusbong na Bituin", "Mapabuti ang pagganap sa pagsusulit ng 20% o higit pa", 
                "Magpakita ng malaking pagbabago sa pagganap sa pagsusulit", 40);
        createSystemBadgeIfNotExists("Dalubhasa sa Pagbabago", "Mapabuti ang pagganap sa pagsusulit ng 30% o higit pa", 
                "Magpakita ng kahanga-hangang pagbabago sa pagganap sa pagsusulit", 55);
        createSystemBadgeIfNotExists("Nangungunang Tagaganap", "Mapanatili ang 85% na average sa 10+ na pagsusulit", 
                "Tuloy-tuloy na mataas na pagganap sa maraming pagsusulit", 75);
        createSystemBadgeIfNotExists("Beteranong Magsusulit", "Makumpleto ang 5 o higit pang pagsusulit", 
                "Makumpleto ang hindi bababa sa 5 pagsusulit", 15);
        createSystemBadgeIfNotExists("Dalubhasang Magsusulit", "Makumpleto ang 20 o higit pang pagsusulit", 
                "Makumpleto ang hindi bababa sa 20 pagsusulit", 50);
    }

    @Override
    public List<BadgeDTO> getMostEarnedBadges(int limit) {
        return getAllActiveBadges().stream()
                .map(this::convertToBadgeDTO)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<BadgeDTO> getRarestBadges(int limit) {
        return getAllActiveBadges().stream()
                .map(this::convertToBadgeDTO)
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Helper Methods
    
    private void awardBadgeIfNotExists(UUID studentId, String badgeTitle, String description, 
                                     Double performanceScore, QuizAttemptEntity quizAttempt) {
        // Find badge by title
        Optional<BadgeEntity> badge = badgeRepository.findByIsActiveTrue().stream()
                .filter(b -> b.getTitle().equals(badgeTitle))
                .findFirst();
        
        if (badge.isPresent() && !hasStudentEarnedBadge(studentId, badge.get().getBadgeId())) {
            StudentBadgeEntity studentBadge = awardBadgeToStudent(studentId, badge.get().getBadgeId(), 
                    performanceScore, "Automatically awarded");
            
            if (quizAttempt != null) {
                studentBadge.setEarnedFromQuizId(quizAttempt.getQuiz().getQuizId());
                studentBadge.setEarnedFromStoryId(quizAttempt.getQuiz().getStory().getStoryId());
                if (quizAttempt.getQuiz().getStory().getClassEntity() != null) {
                    studentBadge.setEarnedFromClassId(quizAttempt.getQuiz().getStory().getClassEntity().getClassId());
                }
                studentBadgeRepository.save(studentBadge);
            }
        }
    }
    
    private void createSystemBadgeIfNotExists(String title, String description, String criteria, int pointsValue) {
        boolean exists = badgeRepository.findByIsActiveTrue().stream()
                .anyMatch(badge -> badge.getTitle().equals(title));
        
        if (!exists) {
            BadgeEntity badge = new BadgeEntity(title, description, criteria);
            badge.setPointsValue(pointsValue);
            badge.setIsActive(true);
            badgeRepository.save(badge);
        }
    }
    
    private int calculateCurrentStreak(List<QuizAttemptEntity> attempts) {
        if (attempts.isEmpty()) return 0;
        
        // Sort by completion date (most recent first)
        attempts.sort((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()));
        
        int streak = 0;
        for (QuizAttemptEntity attempt : attempts) {
            double percentage = (attempt.getScore() / attempt.getMaxPossibleScore()) * 100;
            if (percentage >= 80.0) {
                streak++;
            } else {
                break; // Streak broken
            }
        }
        
        return streak;
    }
    
    private double calculateImprovementPercentage(List<QuizAttemptEntity> attempts) {
        if (attempts.size() < 2) return 0.0;
        
        // Sort by completion date
        attempts.sort((a, b) -> a.getCompletedAt().compareTo(b.getCompletedAt()));
        
        // Get first 3 and last 3 attempts for comparison
        int firstGroupSize = Math.min(3, attempts.size() / 2);
        int lastGroupSize = Math.min(3, attempts.size() / 2);
        
        double firstGroupAvg = attempts.stream()
                .limit(firstGroupSize)
                .mapToDouble(attempt -> (attempt.getScore() / attempt.getMaxPossibleScore()) * 100)
                .average()
                .orElse(0.0);
        
        double lastGroupAvg = attempts.stream()
                .skip(attempts.size() - lastGroupSize)
                .mapToDouble(attempt -> (attempt.getScore() / attempt.getMaxPossibleScore()) * 100)
                .average()
                .orElse(0.0);
        
        return lastGroupAvg - firstGroupAvg;
    }
    
    private BadgeDTO convertToBadgeDTO(BadgeEntity badge) {
        BadgeDTO dto = new BadgeDTO();
        dto.setBadgeId(badge.getBadgeId());
        dto.setTitle(badge.getTitle());
        dto.setDescription(badge.getDescription());
        dto.setCriteria(badge.getCriteria());
        dto.setPointsValue(badge.getPointsValue());
        dto.setImageUrl(badge.getImageUrl());
        dto.setCreatedAt(badge.getCreatedAt());
        dto.setIsActive(badge.getIsActive());
        
        if (badge.getCreatedBy() != null) {
            dto.setCreatedByName(badge.getCreatedBy().getUserName());
        }
        
        return dto;
    }
} 