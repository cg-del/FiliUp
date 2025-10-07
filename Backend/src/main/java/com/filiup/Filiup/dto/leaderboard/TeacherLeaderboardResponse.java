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
public class TeacherLeaderboardResponse {
    private List<SectionLeaderboardDTO> sections;
}
