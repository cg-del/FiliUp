package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.dashboard.*;
import com.filiup.Filiup.entity.*;
import com.filiup.Filiup.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentDashboardService {

    private final PhaseRepository phaseRepository;
    private final LessonRepository lessonRepository;
    private final ActivityRepository activityRepository;
    private final StudentLessonProgressRepository studentLessonProgressRepository;
    private final StudentActivityAttemptRepository studentActivityAttemptRepository;
    private final UserRepository userRepository;

    public StudentDashboardResponse getStudentDashboard(UUID studentId) {
        // Get student info
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<Phase> phases = phaseRepository.findAllByOrderByOrderIndexAsc();
        
        // Get student's lesson progress
        Map<UUID, StudentLessonProgress> lessonProgressMap = studentLessonProgressRepository
                .findByStudentId(studentId)
                .stream()
                .collect(Collectors.toMap(
                    progress -> progress.getLesson().getId(),
                    progress -> progress
                ));

        // Get student's activity attempts (best attempts only for consistency with leaderboard)
        List<StudentActivityAttempt> bestAttempts = 
            studentActivityAttemptRepository.findBestAttemptsByStudentId(studentId);
        
        Map<UUID, StudentActivityAttempt> activityAttemptsMap = bestAttempts.stream()
                .collect(Collectors.toMap(
                    attempt -> attempt.getActivity().getId(),
                    attempt -> attempt
                ));

        List<PhaseResponse> phaseResponses = phases.stream()
                .map(phase -> mapToPhaseResponse(phase, lessonProgressMap, activityAttemptsMap, studentId))
                .collect(Collectors.toList());

        StudentStatsResponse stats = calculateStudentStats(lessonProgressMap, activityAttemptsMap);

        return StudentDashboardResponse.builder()
                .student(buildStudentInfo(student))
                .stats(stats)
                .phases(phaseResponses)
                .build();
    }

    private PhaseResponse mapToPhaseResponse(Phase phase, 
                                          Map<UUID, StudentLessonProgress> lessonProgressMap,
                                          Map<UUID, StudentActivityAttempt> activityAttemptsMap,
                                          UUID studentId) {
        List<LessonProgressResponse> lessonResponses = phase.getLessons().stream()
                .map(lesson -> mapToLessonProgressResponse(lesson, lessonProgressMap, activityAttemptsMap, studentId))
                .collect(Collectors.toList());

        return PhaseResponse.builder()
                .id(phase.getId())
                .title(phase.getTitle())
                .description(phase.getDescription())
                .orderIndex(phase.getOrderIndex())
                .lessons(lessonResponses)
                .build();
    }

    private LessonProgressResponse mapToLessonProgressResponse(Lesson lesson,
                                                             Map<UUID, StudentLessonProgress> lessonProgressMap,
                                                             Map<UUID, StudentActivityAttempt> activityAttemptsMap,
                                                             UUID studentId) {
        StudentLessonProgress lessonProgress = lessonProgressMap.get(lesson.getId());
        boolean isLessonCompleted = lessonProgress != null && lessonProgress.getIsCompleted();

        List<ActivityProgressResponse> activityResponses = lesson.getActivities().stream()
                .map(activity -> mapToActivityProgressResponse(activity, activityAttemptsMap, lessonProgress, lesson))
                .collect(Collectors.toList());

        int completedActivitiesCount = (int) activityResponses.stream()
                .filter(ActivityProgressResponse::getIsCompleted)
                .count();

        int progressPercentage = lesson.getActivities().isEmpty() ? 0 : 
                (completedActivitiesCount * 100) / lesson.getActivities().size();

        boolean activitiesUnlocked = isLessonCompleted || isFirstLesson(lesson);

        return LessonProgressResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .orderIndex(lesson.getOrderIndex())
                .colorClass(getColorClassForLesson(lesson.getOrderIndex()))
                .totalActivities(lesson.getActivities().size())
                .isCompleted(isLessonCompleted)
                .activitiesUnlocked(activitiesUnlocked)
                .progressPercentage(progressPercentage)
                .completedActivitiesCount(completedActivitiesCount)
                .activities(activityResponses)
                .build();
    }

    private ActivityProgressResponse mapToActivityProgressResponse(Activity activity,
                                                                 Map<UUID, StudentActivityAttempt> activityAttemptsMap,
                                                                 StudentLessonProgress lessonProgress,
                                                                 Lesson lesson) {
        StudentActivityAttempt attempt = activityAttemptsMap.get(activity.getId());
        
        boolean isCompleted = attempt != null && attempt.getPercentage().compareTo(BigDecimal.valueOf(75)) >= 0;
        boolean isUnlocked = isActivityUnlocked(activity, lessonProgress, activityAttemptsMap, lesson);
        
        String status = isCompleted ? "completed" : (isUnlocked ? "unlocked" : "locked");

        return ActivityProgressResponse.builder()
                .id(activity.getId())
                .activityType(activity.getActivityType())
                .title(getActivityTitle(activity.getActivityType()))
                .orderIndex(activity.getOrderIndex())
                .status(status)
                .score(attempt != null ? attempt.getScore() : null)
                .percentage(attempt != null ? attempt.getPercentage() : null)
                .isUnlocked(isUnlocked)
                .isCompleted(isCompleted)
                .build();
    }

    private boolean isActivityUnlocked(Activity activity, 
                                     StudentLessonProgress lessonProgress,
                                     Map<UUID, StudentActivityAttempt> activityAttemptsMap,
                                     Lesson lesson) {
        // Lesson must be completed first
        if (lessonProgress == null || !lessonProgress.getIsCompleted()) {
            return false;
        }

        // Multiple Choice is always unlocked after lesson completion
        if (activity.getActivityType() == ActivityType.MULTIPLE_CHOICE) {
            return true;
        }

        // For other activities, check if previous activity has 75%+
        List<Activity> activities = lesson.getActivities().stream()
                .sorted((a1, a2) -> a1.getOrderIndex().compareTo(a2.getOrderIndex()))
                .collect(Collectors.toList());

        int currentIndex = activities.indexOf(activity);
        if (currentIndex <= 0) return true;

        Activity previousActivity = activities.get(currentIndex - 1);
        StudentActivityAttempt previousAttempt = activityAttemptsMap.get(previousActivity.getId());
        
        return previousAttempt != null && 
               previousAttempt.getPercentage().compareTo(BigDecimal.valueOf(75)) >= 0;
    }

    private boolean isFirstLesson(Lesson lesson) {
        return lesson.getOrderIndex() == 1;
    }

    private String getColorClassForLesson(Integer orderIndex) {
        String[] colors = {"bg-gradient-primary", "bg-gradient-success", "bg-gradient-accent", "bg-gradient-warm"};
        return colors[(orderIndex - 1) % colors.length];
    }

    private String getActivityTitle(ActivityType activityType) {
        switch (activityType) {
            case MULTIPLE_CHOICE: return "Multiple Choice";
            case DRAG_DROP: return "Drag & Drop";
            case MATCHING_PAIRS: return "Matching Pairs";
            case STORY_COMPREHENSION: return "Story Reading";
            default: return activityType.name();
        }
    }

    private StudentStatsResponse calculateStudentStats(Map<UUID, StudentLessonProgress> lessonProgressMap,
                                                     Map<UUID, StudentActivityAttempt> activityAttemptsMap) {
        int completedLessons = (int) lessonProgressMap.values().stream()
                .filter(StudentLessonProgress::getIsCompleted)
                .count();

        int totalPoints = activityAttemptsMap.values().stream()
                .mapToInt(StudentActivityAttempt::getScore)
                .sum();

        return StudentStatsResponse.builder()
                .completedLessons(completedLessons)
                .totalScore(totalPoints)
                .totalPoints(totalPoints)
                .currentLevel("Level 1") // This could be calculated based on progress
                .studyDays(12) // This would need to be calculated from activity logs
                .build();
    }
    
    private StudentInfoResponse buildStudentInfo(User student) {
        String sectionName = student.getSection() != null ? student.getSection().getName() : "No Section";
        
        return StudentInfoResponse.builder()
                .id(student.getId().toString())
                .name(student.getFullName())
                .email(student.getEmail())
                .sectionName(sectionName)
                .build();
    }
}
