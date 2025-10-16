package com.filiup.Filiup.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStatsResponse {
    private Integer completedLessons;
    private Integer totalScore;
    private Integer totalPoints;
    private String currentLevel;
    private Integer studyDays;
    private Integer currentRank;
    private String currentPhase;
    private Integer activitiesCompleted;
}
