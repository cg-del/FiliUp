package com.filiup.Filiup.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionLeaderboardDTO {
    private String sectionId;
    private String sectionName;
    private List<StudentRankingDTO> rankings;
    private LeaderboardStatsDTO sectionStats;
}
