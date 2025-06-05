package edu.cit.filiup.service;

import edu.cit.filiup.dto.LeaderboardDTO;
import edu.cit.filiup.entity.LeaderboardEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.LeaderboardRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Autowired
    public LeaderboardService(LeaderboardRepository leaderboardRepository, 
                            UserRepository userRepository,
                            QuizAttemptRepository quizAttemptRepository) {
        this.leaderboardRepository = leaderboardRepository;
        this.userRepository = userRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    @Transactional
    public LeaderboardEntity createLeaderboardEntry(LeaderboardEntity leaderboardEntity, UUID studentId) {
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!"STUDENT".equals(student.getUserRole())) {
            throw new RuntimeException("Only students can have leaderboard entries");
        }

        leaderboardEntity.setStudent(student);
        leaderboardEntity.setLastUpdated(LocalDateTime.now());
        return leaderboardRepository.save(leaderboardEntity);
    }

    public List<LeaderboardEntity> getAllLeaderboardEntries() {
        return leaderboardRepository.findAll();
    }

    public Optional<LeaderboardEntity> getLeaderboardEntryById(UUID entryId) {
        return leaderboardRepository.findById(entryId);
    }

    public List<LeaderboardEntity> getStudentLeaderboardEntries(UUID studentId) {
        return leaderboardRepository.findByStudentUserId(studentId);
    }

    public List<LeaderboardEntity> getLeaderboardByCategory(LeaderboardEntity.Category category) {
        return leaderboardRepository.findByCategory(category);
    }

    public List<LeaderboardEntity> getLeaderboardByTimeFrame(LeaderboardEntity.TimeFrame timeFrame) {
        return leaderboardRepository.findByTimeFrame(timeFrame);
    }

    public List<LeaderboardEntity> getLeaderboardByCategoryAndTimeFrame(
            LeaderboardEntity.Category category,
            LeaderboardEntity.TimeFrame timeFrame) {
        return leaderboardRepository.findByCategoryAndTimeFrame(category, timeFrame);
    }

    // NEW DTO CONVERSION METHODS
    
    public List<LeaderboardDTO> getAllLeaderboardDTOs() {
        return getAllLeaderboardEntries().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public LeaderboardDTO getLeaderboardDTOById(UUID entryId) {
        return getLeaderboardEntryById(entryId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<LeaderboardDTO> getStudentLeaderboardDTOs(UUID studentId) {
        return getStudentLeaderboardEntries(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardDTOsByCategory(LeaderboardEntity.Category category) {
        return getLeaderboardByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardDTOsByTimeFrame(LeaderboardEntity.TimeFrame timeFrame) {
        return getLeaderboardByTimeFrame(timeFrame).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardDTOsByCategoryAndTimeFrame(
            LeaderboardEntity.Category category,
            LeaderboardEntity.TimeFrame timeFrame) {
        return getLeaderboardByCategoryAndTimeFrame(category, timeFrame).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getClassQuizLeaderboardDTOs(UUID classId, LeaderboardEntity.TimeFrame timeFrame) {
        return getClassQuizLeaderboard(classId, timeFrame).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getStoryQuizLeaderboardDTOs(UUID storyId, LeaderboardEntity.TimeFrame timeFrame) {
        return getStoryQuizLeaderboard(storyId, timeFrame).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getOverallQuizLeaderboardDTOs(LeaderboardEntity.TimeFrame timeFrame) {
        return getOverallQuizLeaderboard(timeFrame).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getAccuracyLeaderboardDTOs(LeaderboardEntity.TimeFrame timeFrame, UUID classId) {
        return getAccuracyLeaderboard(timeFrame, classId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getSpeedLeaderboardDTOs(LeaderboardEntity.TimeFrame timeFrame, UUID classId) {
        return getSpeedLeaderboard(timeFrame, classId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LeaderboardDTO convertToDTO(LeaderboardEntity entity) {
        LeaderboardDTO dto = new LeaderboardDTO();
        dto.setEntryId(entity.getEntryId());
        dto.setStudentId(entity.getStudent().getUserId());
        dto.setStudentName(entity.getStudent().getUserName());
        dto.setStudentEmail(entity.getStudent().getUserEmail());
        dto.setScore(entity.getScore());
        dto.setRank(entity.getRank());
        dto.setCategory(entity.getCategory().name());
        dto.setTimeFrame(entity.getTimeFrame().name());
        dto.setAccuracyPercentage(entity.getAccuracyPercentage());
        dto.setAverageTimeMinutes(entity.getAverageTimeMinutes());
        dto.setTotalQuizzesCompleted(entity.getTotalQuizzesCompleted());
        dto.setClassId(entity.getClassId());
        dto.setStoryId(entity.getStoryId());
        dto.setLastUpdated(entity.getLastUpdated());
        
        // Note: className and storyTitle would need to be fetched from their respective repositories
        // For now, leaving them as null - they can be populated if needed
        
        return dto;
    }

    // SUMMARY METHODS

    public Map<String, Object> getClassQuizSummary(UUID classId) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Get quiz statistics for this class
            LocalDateTime startDate = null; // All time
            List<Object[]> stats = quizAttemptRepository.findQuizStatsByClass(classId, startDate);
            
            if (stats.isEmpty()) {
                summary.put("totalStudents", 0);
                summary.put("totalQuizzes", 0);
                summary.put("averageScore", 0.0);
                summary.put("averageAccuracy", 0.0);
                summary.put("averageTimeMinutes", 0.0);
                return summary;
            }
            
            int totalStudents = stats.size();
            long totalQuizzes = stats.stream().mapToLong(stat -> (Long) stat[4]).sum();
            double averageScore = stats.stream().mapToDouble(stat -> ((Long) stat[1]).doubleValue()).average().orElse(0.0);
            double averageAccuracy = stats.stream().mapToDouble(stat -> (Double) stat[2]).average().orElse(0.0);
            double averageTime = stats.stream().mapToDouble(stat -> (Double) stat[3]).average().orElse(0.0);
            
            summary.put("totalStudents", totalStudents);
            summary.put("totalQuizzes", totalQuizzes);
            summary.put("averageScore", Math.round(averageScore * 100.0) / 100.0);
            summary.put("averageAccuracy", Math.round(averageAccuracy * 100.0) / 100.0);
            summary.put("averageTimeMinutes", Math.round(averageTime * 100.0) / 100.0);
            summary.put("classId", classId);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate class quiz summary: " + e.getMessage());
        }
        
        return summary;
    }

    public Map<String, Object> getStoryQuizSummary(UUID storyId) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Get quiz statistics for this story
            LocalDateTime startDate = null; // All time
            List<Object[]> stats = quizAttemptRepository.findQuizStatsByStory(storyId, startDate);
            
            if (stats.isEmpty()) {
                summary.put("totalStudents", 0);
                summary.put("totalQuizzes", 0);
                summary.put("averageScore", 0.0);
                summary.put("averageAccuracy", 0.0);
                summary.put("averageTimeMinutes", 0.0);
                return summary;
            }
            
            int totalStudents = stats.size();
            long totalQuizzes = stats.stream().mapToLong(stat -> (Long) stat[4]).sum();
            double averageScore = stats.stream().mapToDouble(stat -> ((Long) stat[1]).doubleValue()).average().orElse(0.0);
            double averageAccuracy = stats.stream().mapToDouble(stat -> (Double) stat[2]).average().orElse(0.0);
            double averageTime = stats.stream().mapToDouble(stat -> (Double) stat[3]).average().orElse(0.0);
            
            summary.put("totalStudents", totalStudents);
            summary.put("totalQuizzes", totalQuizzes);
            summary.put("averageScore", Math.round(averageScore * 100.0) / 100.0);
            summary.put("averageAccuracy", Math.round(averageAccuracy * 100.0) / 100.0);
            summary.put("averageTimeMinutes", Math.round(averageTime * 100.0) / 100.0);
            summary.put("storyId", storyId);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate story quiz summary: " + e.getMessage());
        }
        
        return summary;
    }

    @Transactional
    public LeaderboardEntity updateLeaderboardEntry(UUID entryId, LeaderboardEntity updatedEntry) {
        return leaderboardRepository.findById(entryId)
                .map(existingEntry -> {
                    existingEntry.setScore(updatedEntry.getScore());
                    existingEntry.setRank(updatedEntry.getRank());
                    existingEntry.setCategory(updatedEntry.getCategory());
                    existingEntry.setTimeFrame(updatedEntry.getTimeFrame());
                    existingEntry.setLastUpdated(LocalDateTime.now());
                    
                    // Update quiz-specific fields if provided
                    if (updatedEntry.getAccuracyPercentage() != null) {
                        existingEntry.setAccuracyPercentage(updatedEntry.getAccuracyPercentage());
                    }
                    if (updatedEntry.getAverageTimeMinutes() != null) {
                        existingEntry.setAverageTimeMinutes(updatedEntry.getAverageTimeMinutes());
                    }
                    if (updatedEntry.getTotalQuizzesCompleted() != null) {
                        existingEntry.setTotalQuizzesCompleted(updatedEntry.getTotalQuizzesCompleted());
                    }
                    
                    return leaderboardRepository.save(existingEntry);
                })
                .orElseThrow(() -> new RuntimeException("Leaderboard entry not found"));
    }

    @Transactional
    public void deleteLeaderboardEntry(UUID entryId) {
        leaderboardRepository.deleteById(entryId);
    }

    @Transactional
    public void updateRanks(LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entries = leaderboardRepository.findByCategoryAndTimeFrame(category, timeFrame);
        
        // Sort entries by score in descending order, then by accuracy, then by speed (ascending)
        entries.sort((a, b) -> {
            int scoreComparison = b.getScore().compareTo(a.getScore());
            if (scoreComparison != 0) return scoreComparison;
            
            if (a.getAccuracyPercentage() != null && b.getAccuracyPercentage() != null) {
                int accuracyComparison = b.getAccuracyPercentage().compareTo(a.getAccuracyPercentage());
                if (accuracyComparison != 0) return accuracyComparison;
            }
            
            if (a.getAverageTimeMinutes() != null && b.getAverageTimeMinutes() != null) {
                return a.getAverageTimeMinutes().compareTo(b.getAverageTimeMinutes()); // Faster is better
            }
            
            return 0;
        });
        
        // Update ranks
        for (int i = 0; i < entries.size(); i++) {
            LeaderboardEntity entry = entries.get(i);
            entry.setRank(i + 1);
            entry.setLastUpdated(LocalDateTime.now());
            leaderboardRepository.save(entry);
        }
    }

    // NEW QUIZ-BASED LEADERBOARD METHODS

    @Transactional
    public void generateQuizBasedLeaderboards() {
        // Generate leaderboards for all time frames
        for (LeaderboardEntity.TimeFrame timeFrame : LeaderboardEntity.TimeFrame.values()) {
            generateQuizLeaderboardsForTimeFrame(timeFrame);
        }
    }

    @Transactional
    public void generateQuizLeaderboardsForTimeFrame(LeaderboardEntity.TimeFrame timeFrame) {
        LocalDateTime startDate = getStartDateForTimeFrame(timeFrame);
        
        // Generate overall quiz performance leaderboard
        generateOverallQuizLeaderboard(timeFrame, startDate);
        
        // Generate class-specific leaderboards
        // This would require getting all classes - simplified for now
        generateClassQuizLeaderboards(timeFrame, startDate);
        
        // Generate story-specific leaderboards  
        // This would require getting all stories - simplified for now
        generateStoryQuizLeaderboards(timeFrame, startDate);
    }

    private void generateOverallQuizLeaderboard(LeaderboardEntity.TimeFrame timeFrame, LocalDateTime startDate) {
        List<Object[]> stats = quizAttemptRepository.findOverallQuizStats(startDate);
        
        for (Object[] stat : stats) {
            UUID studentId = (UUID) stat[0];
            Long totalScore = (Long) stat[1];
            Double accuracyPercentage = (Double) stat[2];
            Double averageTimeMinutes = (Double) stat[3];
            Long totalQuizzes = (Long) stat[4];
            
            UserEntity student = userRepository.findById(studentId).orElse(null);
            if (student == null) continue;
            
            // Update or create overall quiz score leaderboard entry
            updateOrCreateLeaderboardEntry(
                student, 
                totalScore.intValue(), 
                LeaderboardEntity.Category.QUIZ_SCORE, 
                timeFrame,
                accuracyPercentage,
                averageTimeMinutes,
                totalQuizzes.intValue(),
                null, // no specific class
                null  // no specific story
            );
            
            // Update or create accuracy leaderboard entry
            updateOrCreateLeaderboardEntry(
                student,
                (int) Math.round(accuracyPercentage), // Use accuracy as score
                LeaderboardEntity.Category.QUIZ_ACCURACY,
                timeFrame,
                accuracyPercentage,
                averageTimeMinutes,
                totalQuizzes.intValue(),
                null,
                null
            );
            
            // Update or create speed leaderboard entry (lower time is better, so use inverted score)
            int speedScore = averageTimeMinutes > 0 ? (int) Math.round(1000 / averageTimeMinutes) : 0;
            updateOrCreateLeaderboardEntry(
                student,
                speedScore,
                LeaderboardEntity.Category.QUIZ_SPEED,
                timeFrame,
                accuracyPercentage,
                averageTimeMinutes,
                totalQuizzes.intValue(),
                null,
                null
            );
        }
        
        // Update ranks for each category
        updateRanks(LeaderboardEntity.Category.QUIZ_SCORE, timeFrame);
        updateRanks(LeaderboardEntity.Category.QUIZ_ACCURACY, timeFrame);
        updateRanks(LeaderboardEntity.Category.QUIZ_SPEED, timeFrame);
    }

    private void generateClassQuizLeaderboards(LeaderboardEntity.TimeFrame timeFrame, LocalDateTime startDate) {
        // This is a simplified version - in practice, you'd get all class IDs from the database
        // For now, this method would need the specific class IDs passed to it
        // Implementation would be similar to generateClassQuizLeaderboard method below
    }

    private void generateStoryQuizLeaderboards(LeaderboardEntity.TimeFrame timeFrame, LocalDateTime startDate) {
        // This is a simplified version - in practice, you'd get all story IDs from the database
        // For now, this method would need the specific story IDs passed to it
        // Implementation would be similar to generateStoryQuizLeaderboard method below
    }

    @Transactional
    public void generateClassQuizLeaderboard(UUID classId, LeaderboardEntity.TimeFrame timeFrame) {
        LocalDateTime startDate = getStartDateForTimeFrame(timeFrame);
        List<Object[]> stats = quizAttemptRepository.findQuizStatsByClass(classId, startDate);
        
        for (Object[] stat : stats) {
            UUID studentId = (UUID) stat[0];
            Long totalScore = (Long) stat[1];
            Double accuracyPercentage = (Double) stat[2];
            Double averageTimeMinutes = (Double) stat[3];
            Long totalQuizzes = (Long) stat[4];
            
            UserEntity student = userRepository.findById(studentId).orElse(null);
            if (student == null) continue;
            
            updateOrCreateLeaderboardEntry(
                student,
                totalScore.intValue(),
                LeaderboardEntity.Category.CLASS_QUIZ_PERFORMANCE,
                timeFrame,
                accuracyPercentage,
                averageTimeMinutes,
                totalQuizzes.intValue(),
                classId,
                null
            );
        }
        
        // Update ranks for this class leaderboard
        updateClassRanks(classId, LeaderboardEntity.Category.CLASS_QUIZ_PERFORMANCE, timeFrame);
    }

    @Transactional
    public void generateStoryQuizLeaderboard(UUID storyId, LeaderboardEntity.TimeFrame timeFrame) {
        LocalDateTime startDate = getStartDateForTimeFrame(timeFrame);
        List<Object[]> stats = quizAttemptRepository.findQuizStatsByStory(storyId, startDate);
        
        for (Object[] stat : stats) {
            UUID studentId = (UUID) stat[0];
            Long totalScore = (Long) stat[1];
            Double accuracyPercentage = (Double) stat[2];
            Double averageTimeMinutes = (Double) stat[3];
            Long totalQuizzes = (Long) stat[4];
            
            UserEntity student = userRepository.findById(studentId).orElse(null);
            if (student == null) continue;
            
            updateOrCreateLeaderboardEntry(
                student,
                totalScore.intValue(),
                LeaderboardEntity.Category.STORY_QUIZ_PERFORMANCE,
                timeFrame,
                accuracyPercentage,
                averageTimeMinutes,
                totalQuizzes.intValue(),
                null,
                storyId
            );
        }
        
        // Update ranks for this story leaderboard
        updateStoryRanks(storyId, LeaderboardEntity.Category.STORY_QUIZ_PERFORMANCE, timeFrame);
    }

    private void updateOrCreateLeaderboardEntry(UserEntity student, Integer score, 
                                              LeaderboardEntity.Category category,
                                              LeaderboardEntity.TimeFrame timeFrame,
                                              Double accuracyPercentage, Double averageTimeMinutes,
                                              Integer totalQuizzesCompleted, UUID classId, UUID storyId) {
        LeaderboardEntity existing = null;
        
        // Find existing entry based on category
        if (classId != null && storyId != null) {
            existing = leaderboardRepository.findByStudentUserIdAndCategoryAndTimeFrameAndClassIdAndStoryId(
                student.getUserId(), category, timeFrame, classId, storyId);
        } else if (classId != null) {
            existing = leaderboardRepository.findByStudentUserIdAndCategoryAndTimeFrameAndClassId(
                student.getUserId(), category, timeFrame, classId);
        } else if (storyId != null) {
            existing = leaderboardRepository.findByStudentUserIdAndCategoryAndTimeFrameAndStoryId(
                student.getUserId(), category, timeFrame, storyId);
        } else {
            // For overall leaderboards, find by student, category, and timeframe
            List<LeaderboardEntity> entries = leaderboardRepository.findByStudentUserIdAndCategory(student.getUserId(), category);
            existing = entries.stream()
                .filter(e -> e.getTimeFrame() == timeFrame && e.getClassId() == null && e.getStoryId() == null)
                .findFirst()
                .orElse(null);
        }
        
        if (existing != null) {
            // Update existing entry
            existing.setScore(score);
            existing.setAccuracyPercentage(accuracyPercentage);
            existing.setAverageTimeMinutes(averageTimeMinutes);
            existing.setTotalQuizzesCompleted(totalQuizzesCompleted);
            existing.setLastUpdated(LocalDateTime.now());
            leaderboardRepository.save(existing);
        } else {
            // Create new entry
            LeaderboardEntity newEntry = new LeaderboardEntity(
                student, score, category, timeFrame, 
                accuracyPercentage, averageTimeMinutes, totalQuizzesCompleted,
                classId, storyId
            );
            leaderboardRepository.save(newEntry);
        }
    }

    private void updateClassRanks(UUID classId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entries = leaderboardRepository.findByClassIdAndCategoryAndTimeFrameOrderByRankAsc(classId, category, timeFrame);
        
        // Sort by score (descending), then accuracy (descending), then time (ascending)
        entries.sort((a, b) -> {
            int scoreComparison = b.getScore().compareTo(a.getScore());
            if (scoreComparison != 0) return scoreComparison;
            
            if (a.getAccuracyPercentage() != null && b.getAccuracyPercentage() != null) {
                int accuracyComparison = b.getAccuracyPercentage().compareTo(a.getAccuracyPercentage());
                if (accuracyComparison != 0) return accuracyComparison;
            }
            
            if (a.getAverageTimeMinutes() != null && b.getAverageTimeMinutes() != null) {
                return a.getAverageTimeMinutes().compareTo(b.getAverageTimeMinutes());
            }
            
            return 0;
        });
        
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
            entries.get(i).setLastUpdated(LocalDateTime.now());
            leaderboardRepository.save(entries.get(i));
        }
    }

    private void updateStoryRanks(UUID storyId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entries = leaderboardRepository.findByStoryIdAndCategoryAndTimeFrameOrderByRankAsc(storyId, category, timeFrame);
        
        // Sort by score (descending), then accuracy (descending), then time (ascending)
        entries.sort((a, b) -> {
            int scoreComparison = b.getScore().compareTo(a.getScore());
            if (scoreComparison != 0) return scoreComparison;
            
            if (a.getAccuracyPercentage() != null && b.getAccuracyPercentage() != null) {
                int accuracyComparison = b.getAccuracyPercentage().compareTo(a.getAccuracyPercentage());
                if (accuracyComparison != 0) return accuracyComparison;
            }
            
            if (a.getAverageTimeMinutes() != null && b.getAverageTimeMinutes() != null) {
                return a.getAverageTimeMinutes().compareTo(b.getAverageTimeMinutes());
            }
            
            return 0;
        });
        
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
            entries.get(i).setLastUpdated(LocalDateTime.now());
            leaderboardRepository.save(entries.get(i));
        }
    }

    // PUBLIC METHODS FOR CONTROLLER

    public List<LeaderboardEntity> getClassQuizLeaderboard(UUID classId, LeaderboardEntity.TimeFrame timeFrame) {
        // Generate/update the leaderboard first
        generateClassQuizLeaderboard(classId, timeFrame);
        
        // Return the updated leaderboard
        return leaderboardRepository.findByClassIdAndCategoryAndTimeFrameOrderByRankAsc(
            classId, LeaderboardEntity.Category.CLASS_QUIZ_PERFORMANCE, timeFrame);
    }

    public List<LeaderboardEntity> getStoryQuizLeaderboard(UUID storyId, LeaderboardEntity.TimeFrame timeFrame) {
        // Generate/update the leaderboard first
        generateStoryQuizLeaderboard(storyId, timeFrame);
        
        // Return the updated leaderboard
        return leaderboardRepository.findByStoryIdAndCategoryAndTimeFrameOrderByRankAsc(
            storyId, LeaderboardEntity.Category.STORY_QUIZ_PERFORMANCE, timeFrame);
    }

    public List<LeaderboardEntity> getOverallQuizLeaderboard(LeaderboardEntity.TimeFrame timeFrame) {
        // Generate/update the leaderboard first
        LocalDateTime startDate = getStartDateForTimeFrame(timeFrame);
        generateOverallQuizLeaderboard(timeFrame, startDate);
        
        // Return the updated leaderboard
        return leaderboardRepository.findOverallLeaderboard(LeaderboardEntity.Category.QUIZ_SCORE, timeFrame);
    }

    public List<LeaderboardEntity> getAccuracyLeaderboard(LeaderboardEntity.TimeFrame timeFrame, UUID classId) {
        // Generate/update the leaderboard first
        LocalDateTime startDate = getStartDateForTimeFrame(timeFrame);
        generateOverallQuizLeaderboard(timeFrame, startDate);
        
        // Return the accuracy leaderboard
        return leaderboardRepository.findAccuracyLeaderboard(timeFrame, classId);
    }

    public List<LeaderboardEntity> getSpeedLeaderboard(LeaderboardEntity.TimeFrame timeFrame, UUID classId) {
        // Generate/update the leaderboard first
        LocalDateTime startDate = getStartDateForTimeFrame(timeFrame);
        generateOverallQuizLeaderboard(timeFrame, startDate);
        
        // Return the speed leaderboard
        return leaderboardRepository.findSpeedLeaderboard(timeFrame, classId);
    }

    private LocalDateTime getStartDateForTimeFrame(LeaderboardEntity.TimeFrame timeFrame) {
        LocalDateTime now = LocalDateTime.now();
        switch (timeFrame) {
            case DAILY:
                return now.truncatedTo(ChronoUnit.DAYS);
            case WEEKLY:
                return now.minus(7, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
            case MONTHLY:
                return now.minus(30, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
            case ALL_TIME:
            default:
                return null; // No date filter for all time
        }
    }

    // NEW CLASS-BASED LEADERBOARD METHODS

    public List<LeaderboardDTO> getLeaderboardsByClass(UUID classId) {
        List<LeaderboardEntity> entities = leaderboardRepository.findByClassIdAndCategory(classId, null)
                .stream()
                .collect(Collectors.toList());
        
        // If no specific class entries, get all entries and filter
        if (entities.isEmpty()) {
            entities = leaderboardRepository.findAll().stream()
                    .filter(entry -> classId.equals(entry.getClassId()))
                    .collect(Collectors.toList());
        }
        
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardsByClassAndCategory(UUID classId, LeaderboardEntity.Category category) {
        List<LeaderboardEntity> entities = leaderboardRepository.findByClassIdAndCategory(classId, category);
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardsByClassAndTimeFrame(UUID classId, LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entities = leaderboardRepository.findAll().stream()
                .filter(entry -> classId.equals(entry.getClassId()) && timeFrame.equals(entry.getTimeFrame()))
                .collect(Collectors.toList());
        
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardsByClassCategoryAndTimeFrame(UUID classId, 
                                                                          LeaderboardEntity.Category category,
                                                                          LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entities = leaderboardRepository.findByClassIdAndCategoryAndTimeFrameOrderByRankAsc(classId, category, timeFrame);
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // NEW STORY-BASED LEADERBOARD METHODS

    public List<LeaderboardDTO> getLeaderboardsByStory(UUID storyId) {
        List<LeaderboardEntity> entities = leaderboardRepository.findByStoryIdAndCategory(storyId, null)
                .stream()
                .collect(Collectors.toList());
        
        // If no specific story entries, get all entries and filter
        if (entities.isEmpty()) {
            entities = leaderboardRepository.findAll().stream()
                    .filter(entry -> storyId.equals(entry.getStoryId()))
                    .collect(Collectors.toList());
        }
        
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardsByStoryAndCategory(UUID storyId, LeaderboardEntity.Category category) {
        List<LeaderboardEntity> entities = leaderboardRepository.findByStoryIdAndCategory(storyId, category);
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardsByStoryAndTimeFrame(UUID storyId, LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entities = leaderboardRepository.findAll().stream()
                .filter(entry -> storyId.equals(entry.getStoryId()) && timeFrame.equals(entry.getTimeFrame()))
                .collect(Collectors.toList());
        
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LeaderboardDTO> getLeaderboardsByStoryCategoryAndTimeFrame(UUID storyId, 
                                                                          LeaderboardEntity.Category category,
                                                                          LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entities = leaderboardRepository.findByStoryIdAndCategoryAndTimeFrameOrderByRankAsc(storyId, category, timeFrame);
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
