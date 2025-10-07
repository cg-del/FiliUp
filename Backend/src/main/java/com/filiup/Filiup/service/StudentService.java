package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.student.ActivitySubmissionResponse;
import com.filiup.Filiup.dto.student.ProfileResponse;
import com.filiup.Filiup.dto.student.RegisterSectionRequest;
import com.filiup.Filiup.dto.student.SubmitActivityRequest;
import com.filiup.Filiup.dto.teacher.SectionLeaderboardResponse;
import com.filiup.Filiup.dto.teacher.StudentRankingResponse;
import com.filiup.Filiup.entity.*;
import com.filiup.Filiup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;
    private final ActivityRepository activityRepository;
    private final StudentActivityAttemptRepository attemptRepository;
    private final StudentLessonProgressRepository progressRepository;
    private final StudentAchievementRepository achievementRepository;

    @Transactional
    public void registerToSection(UUID studentId, RegisterSectionRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.getRole().equals(UserRole.STUDENT)) {
            throw new RuntimeException("User is not a student");
        }

        Section section = sectionRepository.findByInviteCode(request.getRegistrationCode())
                .orElseThrow(() -> new RuntimeException("Invalid registration code"));

        student.setSection(section);
        userRepository.save(student);
    }

    @Transactional
    public ActivitySubmissionResponse submitActivity(UUID studentId, UUID activityId, SubmitActivityRequest request) {
        if (studentId == null) {
            throw new IllegalArgumentException("Student ID cannot be null");
        }
        
        if (activityId == null) {
            throw new IllegalArgumentException("Activity ID cannot be null");
        }
        
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        // Ensure answers list is not null
        List<Object> answers = request.getAnswers();
        if (answers == null) {
            answers = List.of(); // Empty list if null
        }
        
        // Calculate score based on activity type
        Map<String, Object> result = calculateScore(activity, answers);
        
        int score = (int) result.get("score");
        int totalQuestions = (int) result.get("totalQuestions");
        BigDecimal percentage = BigDecimal.valueOf((score * 100.0) / totalQuestions)
                .setScale(2, RoundingMode.HALF_UP);

        // Check if student already has an attempt for this activity
        List<StudentActivityAttempt> existingAttempts = 
            attemptRepository.findByStudentAndActivity(student, activity);
        
        StudentActivityAttempt attempt;
        if (!existingAttempts.isEmpty()) {
            // Update the most recent existing attempt instead of creating new one
            attempt = existingAttempts.get(0);
            attempt.setScore(score);
            attempt.setTotalQuestions(totalQuestions);
            attempt.setPercentage(percentage);
            attempt.setTimeSpentSeconds(request.getTimeSpentSeconds());
            
            Map<String, Object> answersMap = new HashMap<>();
            answersMap.put("answers", answers);
            attempt.setAnswers(answersMap);
            attempt.setCompletedAt(LocalDateTime.now());
        } else {
            // Create new attempt if this is the first time
            Map<String, Object> answersMap = new HashMap<>();
            answersMap.put("answers", answers);
            
            attempt = StudentActivityAttempt.builder()
                    .student(student)
                    .activity(activity)
                    .score(score)
                    .totalQuestions(totalQuestions)
                    .percentage(percentage)
                    .timeSpentSeconds(request.getTimeSpentSeconds())
                    .answers(answersMap)
                    .completedAt(LocalDateTime.now())
                    .build();
        }

        attemptRepository.save(attempt);

        // Check for achievements
        checkAndAwardAchievements(student, percentage);

        // Find next activity
        ActivitySubmissionResponse.NextActivity nextActivity = findNextActivity(activity);

        return ActivitySubmissionResponse.builder()
                .score(score)
                .percentage(percentage)
                .isCompleted(true)
                .correctAnswers(score)
                .totalQuestions(totalQuestions)
                .nextActivity(nextActivity)
                .build();
    }

    @Transactional
    public void completeLessonReading(UUID studentId, UUID lessonId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Lesson lesson = new Lesson();
        lesson.setId(lessonId);

        StudentLessonProgress progress = progressRepository
                .findByStudentAndLesson(student, lesson)
                .orElse(StudentLessonProgress.builder()
                        .student(student)
                        .lesson(lesson)
                        .build());

        progress.setIsCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        progressRepository.save(progress);
    }

    private Map<String, Object> calculateScore(Activity activity, List<Object> studentAnswers) {
        int score = 0;
        int totalQuestions = 0;

        switch (activity.getActivityType()) {
            case MULTIPLE_CHOICE:
            case STORY_COMPREHENSION:
                // Use the questions entity relationship if content map is null
                if (!activity.getQuestions().isEmpty()) {
                    List<Question> questionEntities = activity.getQuestions();
                    totalQuestions = questionEntities.size();
                    
                    for (int i = 0; i < questionEntities.size() && i < studentAnswers.size(); i++) {
                        Question question = questionEntities.get(i);
                        Integer correctAnswer = question.getCorrectAnswerIndex();
                        Integer studentAnswer = ((Number) studentAnswers.get(i)).intValue();
                        
                        if (correctAnswer.equals(studentAnswer)) {
                            score++;
                        }
                    }
                } else if (activity.getContent() != null) {
                    // Fallback to content map if available
                    Map<String, Object> content = activity.getContent();
                    Object questionsObj = content.get("questions");
                    
                    if (questionsObj instanceof List<?>) {
                        List<?> questionsList = (List<?>) questionsObj;
                        totalQuestions = questionsList.size();
                        
                        for (int i = 0; i < questionsList.size() && i < studentAnswers.size(); i++) {
                            Object questionObj = questionsList.get(i);
                            if (questionObj instanceof Map<?, ?>) {
                                Map<?, ?> question = (Map<?, ?>) questionObj;
                                Object correctAnswerObj = question.get("correctAnswerIndex");
                                
                                if (correctAnswerObj instanceof Number) {
                                    Integer correctAnswer = ((Number) correctAnswerObj).intValue();
                                    Integer studentAnswer = ((Number) studentAnswers.get(i)).intValue();
                                    
                                    if (correctAnswer.equals(studentAnswer)) {
                                        score++;
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            case DRAG_DROP:
                // Use the dragDropItems entity relationship if content map is null
                if (!activity.getDragDropItems().isEmpty()) {
                    List<DragDropItem> itemEntities = activity.getDragDropItems();
                    totalQuestions = itemEntities.size();
                    
                    for (int i = 0; i < itemEntities.size() && i < studentAnswers.size(); i++) {
                        DragDropItem item = itemEntities.get(i);
                        String correctCategory = item.getCorrectCategory();
                        String studentCategory = (String) studentAnswers.get(i);
                        
                        if (correctCategory.equals(studentCategory)) {
                            score++;
                        }
                    }
                } else if (activity.getContent() != null) {
                    // Fallback to content map if available
                    Map<String, Object> content = activity.getContent();
                    Object itemsObj = content.get("dragDropItems");
                    
                    if (itemsObj instanceof List<?>) {
                        List<?> itemsList = (List<?>) itemsObj;
                        totalQuestions = itemsList.size();
                        
                        for (int i = 0; i < itemsList.size() && i < studentAnswers.size(); i++) {
                            Object itemObj = itemsList.get(i);
                            if (itemObj instanceof Map<?, ?>) {
                                Map<?, ?> item = (Map<?, ?>) itemObj;
                                // JSON payload uses "correctCategory" for the expected category id
                                Object categoryObj = item.get("correctCategory");
                                
                                if (categoryObj instanceof String && studentAnswers.get(i) instanceof String) {
                                    String correctCategory = (String) categoryObj;
                                    String studentCategory = (String) studentAnswers.get(i);
                                    
                                    if (correctCategory.equals(studentCategory)) {
                                        score++;
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            case MATCHING_PAIRS:
                // Frontend sends answers as an array of right IDs aligned to the left pairs order
                if (!activity.getMatchingPairs().isEmpty()) {
                    List<MatchingPair> pairEntities = activity.getMatchingPairs();
                    totalQuestions = pairEntities.size();

                    for (int i = 0; i < pairEntities.size() && i < studentAnswers.size(); i++) {
                        MatchingPair pair = pairEntities.get(i);
                        Object ansObj = studentAnswers.get(i);
                        if (ansObj instanceof String) {
                            String rightId = (String) ansObj;
                            // Correct if the chosen right ID equals the pair's ID
                            if (pair.getId().toString().equals(rightId)) {
                                score++;
                            }
                        }
                    }
                } else if (activity.getContent() != null) {
                    // Fallback to content map if available: items have id, leftText, rightText, orderIndex
                    Map<String, Object> content = activity.getContent();
                    Object pairsObj = content.get("matchingPairs");
                    if (pairsObj instanceof List<?>) {
                        List<?> pairsList = (List<?>) pairsObj;
                        totalQuestions = pairsList.size();

                        for (int i = 0; i < pairsList.size() && i < studentAnswers.size(); i++) {
                            Object pairObj = pairsList.get(i);
                            Object ansObj = studentAnswers.get(i);
                            if (pairObj instanceof Map<?, ?> && ansObj instanceof String) {
                                Map<?, ?> pairMap = (Map<?, ?>) pairObj;
                                Object idObj = pairMap.get("id");
                                if (idObj instanceof String) {
                                    if (((String) idObj).equals(ansObj)) {
                                        score++;
                                    }
                                }
                            }
                        }
                    }
                }
                break;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("totalQuestions", totalQuestions);
        return result;
    }

    private void checkAndAwardAchievements(User student, BigDecimal percentage) {
        // Award "Perfect Score" achievement
        if (percentage.compareTo(BigDecimal.valueOf(100)) == 0) {
            if (!achievementRepository.existsByStudentAndAchievementType(student, "PERFECT_SCORE")) {
                StudentAchievement achievement = StudentAchievement.builder()
                        .student(student)
                        .achievementType("PERFECT_SCORE")
                        .achievementName("Perfect Score")
                        .build();
                achievementRepository.save(achievement);
            }
        }

        // Award "First Lesson" achievement
        long completedLessons = progressRepository.findByStudent(student).stream()
                .filter(StudentLessonProgress::getIsCompleted)
                .count();

        if (completedLessons == 1) {
            if (!achievementRepository.existsByStudentAndAchievementType(student, "FIRST_LESSON")) {
                StudentAchievement achievement = StudentAchievement.builder()
                        .student(student)
                        .achievementType("FIRST_LESSON")
                        .achievementName("First Lesson")
                        .build();
                achievementRepository.save(achievement);
            }
        }
    }

    private ActivitySubmissionResponse.NextActivity findNextActivity(Activity currentActivity) {
        Lesson lesson = currentActivity.getLesson();
        List<Activity> activities = activityRepository.findByLessonOrderByOrderIndexAsc(lesson);
        
        int currentIndex = -1;
        for (int i = 0; i < activities.size(); i++) {
            if (activities.get(i).getId().equals(currentActivity.getId())) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex >= 0 && currentIndex < activities.size() - 1) {
            Activity nextActivity = activities.get(currentIndex + 1);
            return ActivitySubmissionResponse.NextActivity.builder()
                    .id(nextActivity.getId())
                    .type(nextActivity.getActivityType().name())
                    .build();
        }

        return null;
    }

    public SectionLeaderboardResponse getStudentSectionLeaderboard(UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getSection() == null) {
            throw new RuntimeException("Student is not assigned to any section");
        }

        Section section = student.getSection();
        List<User> students = section.getStudents();
        
        List<StudentRankingResponse> rankings = students.stream()
                .map(s -> {
                    // Use best attempts only to prevent exploitation
                    List<StudentActivityAttempt> bestAttempts = 
                        attemptRepository.findBestAttemptsByStudentId(s.getId());
                    
                    // Sum only the best score for each unique activity
                    int totalScore = bestAttempts.stream()
                            .mapToInt(attempt -> attempt.getScore() != null ? attempt.getScore() : 0)
                            .sum();
                    
                    int lessonsCompleted = progressRepository.countByStudentIdAndIsCompleted(s.getId(), true);
                    
                    // Count unique activities completed (not total attempts)
                    int activitiesCompleted = (int) bestAttempts.stream()
                            .map(attempt -> attempt.getActivity().getId())
                            .distinct()
                            .count();
                    
                    // Calculate average percentage from best attempts only
                    double averageScore = bestAttempts.stream()
                            .filter(attempt -> attempt.getPercentage() != null)
                            .mapToDouble(attempt -> attempt.getPercentage().doubleValue())
                            .average()
                            .orElse(0.0);

                    return StudentRankingResponse.builder()
                            .id(s.getId())
                            .name(s.getName())
                            .totalScore(totalScore)
                            .lessonsCompleted(lessonsCompleted)
                            .activitiesCompleted(activitiesCompleted)
                            .averageScore(averageScore)
                            .build();
                })
                .sorted((a, b) -> Integer.compare(b.getTotalScore(), a.getTotalScore()))
                .collect(Collectors.toList());

        // Assign ranks
        for (int i = 0; i < rankings.size(); i++) {
            rankings.get(i).setRank(i + 1);
        }

        return SectionLeaderboardResponse.builder()
                .sectionId(section.getId())
                .sectionName(section.getName())
                .gradeLevel(section.getGradeLevel())
                .students(rankings)
                .build();
    }
    
    public ProfileResponse getStudentProfile(UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Get student's basic info
        ProfileResponse.StudentInfo studentInfo = buildStudentInfo(student);
        
        // Get student's stats
        ProfileResponse.StudentStats stats = calculateStudentStats(student);
        
        // Get student's achievements
        List<ProfileResponse.Achievement> achievements = getStudentAchievements(student);
        
        // Get student's recent activity
        List<ProfileResponse.RecentActivity> recentActivity = getRecentActivity(student);
        
        return ProfileResponse.builder()
                .student(studentInfo)
                .stats(stats)
                .achievements(achievements)
                .recentActivity(recentActivity)
                .build();
    }
    
    private ProfileResponse.StudentInfo buildStudentInfo(User student) {
        String sectionName = student.getSection() != null ? student.getSection().getName() : "No Section";
        String joinDate = student.getCreatedAt() != null ? 
                formatDate(student.getCreatedAt()) : "January 2025";
        
        return ProfileResponse.StudentInfo.builder()
                .id(student.getId().toString())
                .name(student.getFullName())
                .email(student.getEmail())
                .sectionName(sectionName)
                .joinDate(joinDate)
                .build();
    }
    
    private ProfileResponse.StudentStats calculateStudentStats(User student) {
        // Get completed lessons count
        int lessonsCompleted = progressRepository.countByStudentIdAndIsCompleted(student.getId(), true);
        
        // Get total lessons count
        int totalLessons = 12; // This should be fetched from the database in a real implementation
        
        // Get total score from best attempts
        List<StudentActivityAttempt> bestAttempts = 
                attemptRepository.findBestAttemptsByStudentId(student.getId());
        
        int totalScore = bestAttempts.stream()
                .mapToInt(attempt -> attempt.getScore() != null ? attempt.getScore() : 0)
                .sum();
        
        // Determine current phase based on progress
        String currentPhase = "Phase 1";
        if (lessonsCompleted > 8) {
            currentPhase = "Phase 3";
        } else if (lessonsCompleted > 4) {
            currentPhase = "Phase 2";
        }
        
        return ProfileResponse.StudentStats.builder()
                .totalScore(totalScore)
                .lessonsCompleted(lessonsCompleted)
                .totalLessons(totalLessons)
                .currentPhase(currentPhase)
                .build();
    }
    
    private List<ProfileResponse.Achievement> getStudentAchievements(User student) {
        // Get student's achievements from the database
        List<StudentAchievement> dbAchievements = achievementRepository.findByStudent(student);
        
        // Define all possible achievements
        List<ProfileResponse.Achievement> allAchievements = new ArrayList<>();
        allAchievements.add(new ProfileResponse.Achievement("1", "First Lesson", "🎯", false));
        allAchievements.add(new ProfileResponse.Achievement("2", "Perfect Score", "💯", false));
        allAchievements.add(new ProfileResponse.Achievement("3", "5 Lessons", "📚", false));
        allAchievements.add(new ProfileResponse.Achievement("4", "10 Lessons", "🏆", false));
        allAchievements.add(new ProfileResponse.Achievement("5", "Quick Learner", "⚡", false));
        allAchievements.add(new ProfileResponse.Achievement("6", "Phase Master", "👑", false));
        
        // Mark earned achievements
        for (StudentAchievement dbAchievement : dbAchievements) {
            for (ProfileResponse.Achievement achievement : allAchievements) {
                if (achievement.getName().equals(dbAchievement.getAchievementName())) {
                    achievement.setEarned(true);
                    break;
                }
            }
        }
        
        // Check for additional achievements based on progress
        int lessonsCompleted = progressRepository.countByStudentIdAndIsCompleted(student.getId(), true);
        if (lessonsCompleted >= 1) {
            allAchievements.get(0).setEarned(true); // First Lesson
        }
        if (lessonsCompleted >= 5) {
            allAchievements.get(2).setEarned(true); // 5 Lessons
        }
        if (lessonsCompleted >= 10) {
            allAchievements.get(3).setEarned(true); // 10 Lessons
        }
        
        return allAchievements;
    }
    
    private List<ProfileResponse.RecentActivity> getRecentActivity(User student) {
        // Get student's recent activity attempts
        List<StudentActivityAttempt> recentAttempts = 
                attemptRepository.findTop5ByStudentIdOrderByCreatedAtDesc(student.getId());
        
        return recentAttempts.stream().map(attempt -> {
            String lessonTitle = attempt.getActivity().getLesson().getTitle();
            int score = attempt.getPercentage().intValue();
            String date = formatRelativeDate(attempt.getCompletedAt());
            
            return ProfileResponse.RecentActivity.builder()
                    .lesson(lessonTitle)
                    .score(score)
                    .date(date)
                    .build();
        }).collect(Collectors.toList());
    }
    
    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("MMMM yyyy"));
    }
    
    private String formatRelativeDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        long daysDiff = ChronoUnit.DAYS.between(dateTime, now);
        
        if (daysDiff == 0) {
            return "Today";
        } else if (daysDiff == 1) {
            return "Yesterday";
        } else if (daysDiff < 7) {
            return daysDiff + " days ago";
        } else if (daysDiff < 14) {
            return "1 week ago";
        } else if (daysDiff < 30) {
            return (daysDiff / 7) + " weeks ago";
        } else if (daysDiff < 60) {
            return "1 month ago";
        } else {
            return (daysDiff / 30) + " months ago";
        }
    }
}
