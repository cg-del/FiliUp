package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.lesson.LessonContentResponse;
import com.filiup.Filiup.dto.lesson.LessonSlideResponse;
import com.filiup.Filiup.entity.Lesson;
import com.filiup.Filiup.entity.LessonSlide;
import com.filiup.Filiup.repository.LessonRepository;
import com.filiup.Filiup.repository.LessonSlideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LessonContentService {

    private final LessonRepository lessonRepository;
    private final LessonSlideRepository lessonSlideRepository;

    public LessonContentResponse getLessonContent(UUID lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        List<LessonSlide> slides = lessonSlideRepository.findByLessonIdOrderByOrderIndexAsc(lessonId);

        return LessonContentResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .orderIndex(lesson.getOrderIndex())
                .slides(slides.stream()
                        .map(this::mapToSlideResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private LessonSlideResponse mapToSlideResponse(LessonSlide slide) {
        return LessonSlideResponse.builder()
                .id(slide.getId())
                .title(slide.getTitle())
                .content(slide.getContent())
                .orderIndex(slide.getOrderIndex())
                .build();
    }
}
