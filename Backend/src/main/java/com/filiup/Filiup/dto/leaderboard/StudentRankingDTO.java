package com.filiup.Filiup.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRankingDTO {
    private String studentId;
    private String studentName;
    private Integer totalScore;
    private BigDecimal averagePercentage;
    private Integer completedActivities;
    private Integer completedLessons;
    private Integer rank;
    private String badge;
    private LocalDateTime lastActivityDate;
}
