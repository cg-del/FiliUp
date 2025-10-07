package com.filiup.Filiup.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardStatsDTO {
    private Integer totalStudents;
    private BigDecimal averageScore;
    private Integer topScore;
    private BigDecimal averageCompletion;
}
