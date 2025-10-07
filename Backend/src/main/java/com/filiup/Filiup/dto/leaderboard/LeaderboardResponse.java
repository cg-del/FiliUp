package com.filiup.Filiup.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private String sectionName;
    private String sectionId;
    private List<StudentRankingDTO> rankings;
    private StudentRankingDTO currentStudentRank;
    private LeaderboardStatsDTO sectionStats;
    private LocalDateTime lastUpdated;
}
