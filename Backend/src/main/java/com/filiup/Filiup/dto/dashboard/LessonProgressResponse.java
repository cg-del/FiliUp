package com.filiup.Filiup.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer orderIndex;
    private String colorClass;
    private Integer totalActivities;
    private Boolean isCompleted;
    private Boolean isUnlocked;
    private Boolean activitiesUnlocked;
    private Integer progressPercentage;
    private Integer completedActivitiesCount;
    private List<ActivityProgressResponse> activities;
}
