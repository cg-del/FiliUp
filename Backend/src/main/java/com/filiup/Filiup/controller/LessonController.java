package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.LessonCreateRequest;
import com.filiup.Filiup.dto.LessonResponse;
import com.filiup.Filiup.entity.Lesson;
import com.filiup.Filiup.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/lessons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getAllLessons() {
        List<LessonResponse> lessons = lessonService.getAllLessons();
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<List<LessonResponse>> getLessonsByPhase(@PathVariable UUID phaseId) {
        List<LessonResponse> lessons = lessonService.getLessonsByPhase(phaseId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLessonById(@PathVariable UUID id) {
        LessonResponse lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(lesson);
    }

    @PostMapping
    public ResponseEntity<LessonResponse> createLesson(@RequestBody LessonCreateRequest request) {
        LessonResponse createdLesson = lessonService.createLesson(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLesson);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonResponse> updateLesson(@PathVariable UUID id, @RequestBody LessonCreateRequest request) {
        LessonResponse updatedLesson = lessonService.updateLesson(id, request);
        return ResponseEntity.ok(updatedLesson);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable UUID id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/activities-count")
    public ResponseEntity<Integer> getActivitiesCount(@PathVariable UUID id) {
        int count = lessonService.getActivitiesCount(id);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}/slides-count")
    public ResponseEntity<Integer> getSlidesCount(@PathVariable UUID id) {
        int count = lessonService.getSlidesCount(id);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<Void> reorderLesson(@PathVariable UUID id, @RequestParam Integer newOrderIndex) {
        lessonService.reorderLesson(id, newOrderIndex);
        return ResponseEntity.ok().build();
    }
}
