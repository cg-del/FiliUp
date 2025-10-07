package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.ActivityCreateRequest;
import com.filiup.Filiup.dto.ActivityResponse;
import com.filiup.Filiup.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/activities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getAllActivities() {
        List<ActivityResponse> activities = activityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<ActivityResponse>> getActivitiesByLesson(@PathVariable UUID lessonId) {
        List<ActivityResponse> activities = activityService.getActivitiesByLesson(lessonId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityResponse> getActivityById(@PathVariable UUID id) {
        ActivityResponse activity = activityService.getActivityById(id);
        return ResponseEntity.ok(activity);
    }

    @PostMapping
    public ResponseEntity<ActivityResponse> createActivity(@RequestBody ActivityCreateRequest request) {
        ActivityResponse createdActivity = activityService.createActivity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdActivity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivityResponse> updateActivity(@PathVariable UUID id, @RequestBody ActivityCreateRequest request) {
        ActivityResponse updatedActivity = activityService.updateActivity(id, request);
        return ResponseEntity.ok(updatedActivity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable UUID id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<Void> reorderActivity(@PathVariable UUID id, @RequestParam Integer newOrderIndex) {
        activityService.reorderActivity(id, newOrderIndex);
        return ResponseEntity.ok().build();
    }
}
