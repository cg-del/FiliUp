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
public class PhaseResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer orderIndex;
    private Boolean isUnlocked;
    private Integer totalActivitiesCount;
    private Integer completedActivitiesCount;
    private List<LessonProgressResponse> lessons;
}
