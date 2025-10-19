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

        StudentStatsResponse stats = calculateStudentStats(student, phases, lessonProgressMap, activityAttemptsMap);

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
        // Check if phase is unlocked
        boolean isPhaseUnlocked = isPhaseUnlocked(phase, lessonProgressMap, activityAttemptsMap);
        
        List<LessonProgressResponse> lessonResponses = phase.getLessons().stream()
                .map(lesson -> mapToLessonProgressResponse(lesson, lessonProgressMap, activityAttemptsMap, studentId, phase, isPhaseUnlocked))
                .collect(Collectors.toList());

        // Calculate phase activity counts
        int totalActivitiesInPhase = phase.getLessons().stream()
                .mapToInt(lesson -> lesson.getActivities().size())
                .sum();
        
        int completedActivitiesInPhase = (int) lessonResponses.stream()
                .flatMap(lesson -> lesson.getActivities().stream())
                .filter(ActivityProgressResponse::getIsCompleted)
                .count();

        return PhaseResponse.builder()
                .id(phase.getId())
                .title(phase.getTitle())
                .description(phase.getDescription())
                .orderIndex(phase.getOrderIndex())
                .isUnlocked(isPhaseUnlocked)
                .totalActivitiesCount(totalActivitiesInPhase)
                .completedActivitiesCount(completedActivitiesInPhase)
                .lessons(lessonResponses)
                .build();
    }

    private LessonProgressResponse mapToLessonProgressResponse(Lesson lesson,
                                                             Map<UUID, StudentLessonProgress> lessonProgressMap,
                                                             Map<UUID, StudentActivityAttempt> activityAttemptsMap,
                                                             UUID studentId,
                                                             Phase phase,
                                                             boolean isPhaseUnlocked) {
        StudentLessonProgress lessonProgress = lessonProgressMap.get(lesson.getId());
        boolean isLessonCompleted = lessonProgress != null && lessonProgress.getIsCompleted();

        // Check if lesson is unlocked
        boolean isLessonUnlocked = isLessonUnlocked(lesson, phase, lessonProgressMap, activityAttemptsMap, isPhaseUnlocked);

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
                .isUnlocked(isLessonUnlocked)
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

    /**
     * Check if a phase is unlocked for the student.
     * Phase 1 is always unlocked.
     * Other phases are unlocked only if ALL activities in ALL lessons of ALL previous phases are completed.
     * This ensures strict sequential progression through phases.
     */
    private boolean isPhaseUnlocked(Phase phase, 
                                   Map<UUID, StudentLessonProgress> lessonProgressMap,
                                   Map<UUID, StudentActivityAttempt> activityAttemptsMap) {
        // First phase is always unlocked
        if (phase.getOrderIndex() == 1) {
            return true;
        }

        // Get all phases ordered by index
        List<Phase> allPhases = phaseRepository.findAllByOrderByOrderIndexAsc();
        
        // Check ALL previous phases (not just the immediate one)
        for (Phase previousPhase : allPhases) {
            // Only check phases that come before the current phase
            if (previousPhase.getOrderIndex() >= phase.getOrderIndex()) {
                break; // We've reached the current phase, stop checking
            }
            
            // Check if ALL activities in ALL lessons of this previous phase are completed
            for (Lesson lesson : previousPhase.getLessons()) {
                for (Activity activity : lesson.getActivities()) {
                    StudentActivityAttempt attempt = activityAttemptsMap.get(activity.getId());
                    // Activity must be completed with >= 75%
                    if (attempt == null || attempt.getPercentage().compareTo(BigDecimal.valueOf(75)) < 0) {
                        return false; // Found an incomplete activity in a previous phase
                    }
                }
            }
        }

        return true; // All activities in ALL previous phases are completed
    }

    /**
     * Check if a lesson is unlocked for the student.
     * First lesson in a phase is unlocked if the phase is unlocked.
     * Other lessons are unlocked only if ALL activities in the previous lesson are completed.
     */
    private boolean isLessonUnlocked(Lesson lesson,
                                    Phase phase,
                                    Map<UUID, StudentLessonProgress> lessonProgressMap,
                                    Map<UUID, StudentActivityAttempt> activityAttemptsMap,
                                    boolean isPhaseUnlocked) {
        // If phase is locked, all lessons in it are locked
        if (!isPhaseUnlocked) {
            return false;
        }

        // First lesson in the phase is unlocked if phase is unlocked
        if (lesson.getOrderIndex() == 1) {
            return true;
        }

        // Find the previous lesson in the same phase
        Lesson previousLesson = null;
        for (Lesson l : phase.getLessons()) {
            if (l.getOrderIndex() == lesson.getOrderIndex() - 1) {
                previousLesson = l;
                break;
            }
        }

        if (previousLesson == null) {
            return true; // If no previous lesson found, unlock by default
        }

        // Check if ALL activities in the previous lesson are completed
        for (Activity activity : previousLesson.getActivities()) {
            StudentActivityAttempt attempt = activityAttemptsMap.get(activity.getId());
            // Activity must be completed with >= 75%
            if (attempt == null || attempt.getPercentage().compareTo(BigDecimal.valueOf(75)) < 0) {
                return false;
            }
        }

        return true; // All activities in previous lesson are completed
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

    private StudentStatsResponse calculateStudentStats(User student,
                                                     List<Phase> phases,
                                                     Map<UUID, StudentLessonProgress> lessonProgressMap,
                                                     Map<UUID, StudentActivityAttempt> activityAttemptsMap) {
        int completedLessons = (int) lessonProgressMap.values().stream()
                .filter(StudentLessonProgress::getIsCompleted)
                .count();

        int totalPoints = activityAttemptsMap.values().stream()
                .mapToInt(StudentActivityAttempt::getScore)
                .sum();

        // Calculate current rank in section leaderboard
        Integer currentRank = calculateCurrentRank(student, totalPoints);
        
        // Calculate current phase based on progress
        String currentPhase = calculateCurrentPhase(phases, lessonProgressMap);
        
        // Count activities completed (with passing score >= 75%)
        int activitiesCompleted = (int) activityAttemptsMap.values().stream()
                .filter(attempt -> attempt.getPercentage().compareTo(BigDecimal.valueOf(75)) >= 0)
                .count();

        return StudentStatsResponse.builder()
                .completedLessons(completedLessons)
                .totalScore(totalPoints)
                .totalPoints(totalPoints)
                .currentLevel("Level 1") // This could be calculated based on progress
                .studyDays(12) // This would need to be calculated from activity logs
                .currentRank(currentRank)
                .currentPhase(currentPhase)
                .activitiesCompleted(activitiesCompleted)
                .build();
    }
    
    private Integer calculateCurrentRank(User student, int studentTotalScore) {
        // If student has no section, return null
        if (student.getSection() == null) {
            return null;
        }
        
        // Get all students in the same section
        List<User> sectionStudents = student.getSection().getStudents();
        
        // Calculate scores for all students and sort
        List<Integer> scores = sectionStudents.stream()
                .map(s -> {
                    List<StudentActivityAttempt> bestAttempts = 
                        studentActivityAttemptRepository.findBestAttemptsByStudentId(s.getId());
                    return bestAttempts.stream()
                            .mapToInt(attempt -> attempt.getScore() != null ? attempt.getScore() : 0)
                            .sum();
                })
                .sorted((a, b) -> Integer.compare(b, a)) // Sort descending
                .collect(Collectors.toList());
        
        // Find rank (1-indexed)
        int rank = 1;
        for (int score : scores) {
            if (score > studentTotalScore) {
                rank++;
            } else {
                break;
            }
        }
        
        return rank;
    }
    
    private String calculateCurrentPhase(List<Phase> phases, Map<UUID, StudentLessonProgress> lessonProgressMap) {
        // Find the current phase based on which lessons are in progress
        for (Phase phase : phases) {
            boolean hasInProgressLesson = phase.getLessons().stream()
                    .anyMatch(lesson -> {
                        StudentLessonProgress progress = lessonProgressMap.get(lesson.getId());
                        // If lesson is not completed or doesn't exist in progress, it's current
                        return progress == null || !progress.getIsCompleted();
                    });
            
            if (hasInProgressLesson) {
                return phase.getTitle();
            }
        }
        
        // If all phases are completed, return the last phase
        return phases.isEmpty() ? "No Phase" : phases.get(phases.size() - 1).getTitle();
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
