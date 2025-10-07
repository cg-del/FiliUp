package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.LessonCreateRequest;
import com.filiup.Filiup.dto.LessonResponse;
import com.filiup.Filiup.entity.*;
import com.filiup.Filiup.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LessonService {

    private final PhaseRepository phaseRepository;
    private final LessonRepository lessonRepository;
    private final LessonSlideRepository lessonSlideRepository;
    private final ActivityRepository activityRepository;
    private final StudentLessonProgressRepository progressRepository;
    private final StudentActivityAttemptRepository attemptRepository;
    private final UserRepository userRepository;

    public List<Map<String, Object>> getLessonsWithProgress(UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Phase> phases = phaseRepository.findAllByOrderByOrderIndexAsc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Phase phase : phases) {
            Map<String, Object> phaseData = new HashMap<>();
            phaseData.put("id", phase.getId());
            phaseData.put("title", phase.getTitle());
            phaseData.put("description", phase.getDescription());

            List<Map<String, Object>> lessonsData = new ArrayList<>();
            for (Lesson lesson : phase.getLessons()) {
                Map<String, Object> lessonData = new HashMap<>();
                lessonData.put("id", lesson.getId());
                lessonData.put("title", lesson.getTitle());
                lessonData.put("description", lesson.getDescription());

                // Check if lesson is completed
                Optional<StudentLessonProgress> progress = progressRepository
                        .findByStudentAndLesson(student, lesson);
                lessonData.put("isCompleted", progress.map(StudentLessonProgress::getIsCompleted).orElse(false));

                // Get activities progress
                List<Map<String, Object>> activitiesData = new ArrayList<>();
                for (Activity activity : lesson.getActivities()) {
                    Map<String, Object> activityData = new HashMap<>();
                    activityData.put("id", activity.getId());
                    activityData.put("type", activity.getActivityType().name());
                    activityData.put("orderIndex", activity.getOrderIndex());

                    // Get best attempt
                    Optional<StudentActivityAttempt> bestAttempt = attemptRepository
                            .findBestAttempt(student, activity);
                    
                    if (bestAttempt.isPresent()) {
                        activityData.put("status", "completed");
                        activityData.put("score", bestAttempt.get().getPercentage());
                    } else {
                        activityData.put("status", "unlocked");
                        activityData.put("score", null);
                    }

                    activitiesData.add(activityData);
                }

                lessonData.put("activities", activitiesData);
                lessonsData.add(lessonData);
            }

            phaseData.put("lessons", lessonsData);
            result.add(phaseData);
        }

        return result;
    }

    public Map<String, Object> getLessonContent(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("id", lesson.getId());
        result.put("title", lesson.getTitle());
        result.put("description", lesson.getDescription());
        result.put("content", lesson.getContent());

        return result;
    }

    public Map<String, Object> getActivityContent(UUID activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("id", activity.getId());
        result.put("type", activity.getActivityType().name());
        result.put("content", activity.getContent());
        result.put("passingPercentage", activity.getPassingPercentage());

        return result;
    }

    // Admin methods for lesson management
    public List<LessonResponse> getAllLessons() {
        List<Lesson> lessons = lessonRepository.findAllByOrderByOrderIndexAsc();
        return lessons.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getLessonsByPhase(UUID phaseId) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + phaseId));
        
        return phase.getLessons().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public LessonResponse getLessonById(UUID id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));
        return convertToResponse(lesson);
    }

    public LessonResponse createLesson(LessonCreateRequest request) {
        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + request.getPhaseId()));

        // Create lesson
        Lesson lesson = Lesson.builder()
                .phase(phase)
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .build();

        // Ensure order index is set correctly
        if (lesson.getOrderIndex() == null) {
            Integer maxOrder = lessonRepository.findMaxOrderIndexByPhase(phase.getId());
            lesson.setOrderIndex(maxOrder != null ? maxOrder + 1 : 1);
        }

        lesson = lessonRepository.save(lesson);

        // Create slides
        if (request.getSlides() != null && !request.getSlides().isEmpty()) {
            for (LessonCreateRequest.LessonSlideDto slideDto : request.getSlides()) {
                LessonSlide slide = LessonSlide.builder()
                        .lesson(lesson)
                        .title(slideDto.getTitle())
                        .content(slideDto.getContent())
                        .orderIndex(slideDto.getOrderIndex())
                        .build();
                lessonSlideRepository.save(slide);
            }
        }

        log.info("Created new lesson: {} in phase: {}", lesson.getTitle(), phase.getTitle());
        return convertToResponse(lesson);
    }

    public LessonResponse updateLesson(UUID id, LessonCreateRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));

        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + request.getPhaseId()));

        lesson.setPhase(phase);
        lesson.setTitle(request.getTitle());
        lesson.setDescription(request.getDescription());
        lesson.setOrderIndex(request.getOrderIndex());

        // Clear existing slides using the entity relationship (this will trigger orphanRemoval)
        lesson.getSlides().clear();
        
        // Add new slides to the entity collection
        if (request.getSlides() != null && !request.getSlides().isEmpty()) {
            for (LessonCreateRequest.LessonSlideDto slideDto : request.getSlides()) {
                LessonSlide slide = LessonSlide.builder()
                        .lesson(lesson)
                        .title(slideDto.getTitle())
                        .content(slideDto.getContent())
                        .orderIndex(slideDto.getOrderIndex())
                        .build();
                lesson.getSlides().add(slide);
            }
        }

        // Save the lesson (this will cascade to save new slides and delete orphaned ones)
        lesson = lessonRepository.save(lesson);

        log.info("Updated lesson: {}", lesson.getTitle());
        return convertToResponse(lesson);
    }

    public void deleteLesson(UUID id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));

        lessonRepository.delete(lesson);
        log.info("Deleted lesson: {}", lesson.getTitle());
    }

    public int getActivitiesCount(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        return lesson.getActivities().size();
    }

    public int getSlidesCount(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
        return lesson.getSlides().size();
    }

    public void reorderLesson(UUID id, Integer newOrderIndex) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + id));

        lesson.setOrderIndex(newOrderIndex);
        lessonRepository.save(lesson);
        log.info("Reordered lesson: {} to position {}", lesson.getTitle(), newOrderIndex);
    }

    private LessonResponse convertToResponse(Lesson lesson) {
        List<LessonResponse.LessonSlideDto> slideDtos = lesson.getSlides().stream()
                .map(slide -> LessonResponse.LessonSlideDto.builder()
                        .id(slide.getId())
                        .title(slide.getTitle())
                        .content(slide.getContent())
                        .orderIndex(slide.getOrderIndex())
                        .build())
                .collect(Collectors.toList());

        return LessonResponse.builder()
                .id(lesson.getId())
                .phaseId(lesson.getPhase().getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .orderIndex(lesson.getOrderIndex())
                .slidesCount(lesson.getSlides().size())
                .activitiesCount(lesson.getActivities().size())
                .createdAt(lesson.getCreatedAt())
                .slides(slideDtos)
                .build();
    }
}
