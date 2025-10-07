package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.teacher.*;
import com.filiup.Filiup.entity.Section;
import com.filiup.Filiup.entity.StudentActivityAttempt;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.repository.SectionRepository;
import com.filiup.Filiup.repository.StudentActivityAttemptRepository;
import com.filiup.Filiup.repository.StudentLessonProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final SectionRepository sectionRepository;
    private final StudentLessonProgressRepository lessonProgressRepository;
    private final StudentActivityAttemptRepository activityAttemptRepository;

    public TeacherDashboardResponse getDashboard(UUID teacherId) {
        List<Section> sections = sectionRepository.findByTeacherId(teacherId);
        
        TeacherStatsResponse stats = calculateTeacherStats(sections);
        List<TeacherSectionResponse> sectionResponses = sections.stream()
                .map(this::mapToTeacherSectionResponse)
                .collect(Collectors.toList());
        List<RecentActivityResponse> recentActivity = getRecentActivity(teacherId);

        return TeacherDashboardResponse.builder()
                .stats(stats)
                .sections(sectionResponses)
                .recentActivity(recentActivity)
                .build();
    }

    public SectionLeaderboardResponse getSectionLeaderboard(UUID sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        List<StudentRankingResponse> rankings = calculateStudentRankings(section);

        return SectionLeaderboardResponse.builder()
                .sectionId(section.getId())
                .sectionName(section.getName())
                .gradeLevel(section.getGradeLevel())
                .students(rankings)
                .build();
    }

    public List<SectionLeaderboardResponse> getAllSectionsLeaderboard(UUID teacherId) {
        List<Section> sections = sectionRepository.findByTeacherId(teacherId);
        
        return sections.stream()
                .map(section -> {
                    List<StudentRankingResponse> rankings = calculateStudentRankings(section);
                    return SectionLeaderboardResponse.builder()
                            .sectionId(section.getId())
                            .sectionName(section.getName())
                            .gradeLevel(section.getGradeLevel())
                            .students(rankings)
                            .build();
                })
                .collect(Collectors.toList());
    }


    private TeacherStatsResponse calculateTeacherStats(List<Section> sections) {
        int totalStudents = sections.stream()
                .mapToInt(section -> section.getStudents().size())
                .sum();

        int activeSections = (int) sections.stream()
                .filter(Section::getIsActive)
                .count();

        double averageProgress = sections.stream()
                .flatMap(section -> section.getStudents().stream())
                .mapToDouble(this::calculateStudentProgress)
                .average()
                .orElse(0.0);

        // For now, set activities created to a placeholder
        int activitiesCreated = 12; // This would come from actual activity creation tracking

        return TeacherStatsResponse.builder()
                .totalStudents(totalStudents)
                .activeSections(activeSections)
                .averageProgress(averageProgress)
                .activitiesCreated(activitiesCreated)
                .build();
    }

    private TeacherSectionResponse mapToTeacherSectionResponse(Section section) {
        List<User> students = section.getStudents();
        int totalStudents = students.size();
        
        // Calculate active students (those who have activity in last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        int activeStudents = (int) students.stream()
                .filter(student -> hasRecentActivity(student.getId(), weekAgo))
                .count();

        double averageProgress = students.stream()
                .mapToDouble(this::calculateStudentProgress)
                .average()
                .orElse(0.0);

        return TeacherSectionResponse.builder()
                .id(section.getId())
                .name(section.getName())
                .gradeLevel(section.getGradeLevel())
                .totalStudents(totalStudents)
                .activeStudents(activeStudents)
                .averageProgress(averageProgress)
                .inviteCode(section.getInviteCode())
                .status(section.getIsActive() ? "active" : "inactive")
                .build();
    }

    private List<RecentActivityResponse> getRecentActivity(UUID teacherId) {
        // Get recent activity from all sections of this teacher
        List<Section> sections = sectionRepository.findByTeacherId(teacherId);
        
        return sections.stream()
                .flatMap(section -> section.getStudents().stream())
                .flatMap(student -> activityAttemptRepository.findTop5ByStudentIdOrderByCreatedAtDesc(student.getId()).stream())
                .limit(10)
                .map(attempt -> RecentActivityResponse.builder()
                        .studentId(attempt.getStudent().getId())
                        .studentName(attempt.getStudent().getName())
                        .activity(attempt.getActivity().getTitle())
                        .score(attempt.getScore())
                        .timestamp(attempt.getCreatedAt())
                        .timeAgo(formatTimeAgo(attempt.getCreatedAt()))
                        .build())
                .collect(Collectors.toList());
    }

    private List<StudentRankingResponse> calculateStudentRankings(Section section) {
        List<User> students = section.getStudents();
        
        List<StudentRankingResponse> rankings = students.stream()
                .map(student -> {
                    // Use best attempts only to prevent exploitation
                    List<StudentActivityAttempt> bestAttempts = 
                        activityAttemptRepository.findBestAttemptsByStudentId(student.getId());
                    
                    // Sum only the best score for each unique activity
                    int totalScore = bestAttempts.stream()
                            .mapToInt(attempt -> attempt.getScore() != null ? attempt.getScore() : 0)
                            .sum();
                    
                    int lessonsCompleted = lessonProgressRepository.countByStudentIdAndIsCompleted(student.getId(), true);
                    
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
                            .id(student.getId())
                            .name(student.getName())
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

        return rankings;
    }

    private double calculateStudentProgress(User student) {
        int totalLessons = lessonProgressRepository.countByStudentId(student.getId());
        int completedLessons = lessonProgressRepository.countByStudentIdAndIsCompleted(student.getId(), true);
        
        if (totalLessons == 0) return 0.0;
        return (double) completedLessons / totalLessons * 100.0;
    }

    private boolean hasRecentActivity(UUID studentId, LocalDateTime since) {
        return activityAttemptRepository.existsByStudentIdAndCreatedAtAfter(studentId, since);
    }

    private String formatTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        
        if (hours < 1) {
            long minutes = ChronoUnit.MINUTES.between(dateTime, now);
            return minutes + " minutes ago";
        } else if (hours < 24) {
            return hours + " hours ago";
        } else {
            long days = ChronoUnit.DAYS.between(dateTime, now);
            return days + " days ago";
        }
    }
}
