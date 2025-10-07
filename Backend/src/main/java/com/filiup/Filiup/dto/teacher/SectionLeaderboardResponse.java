package com.filiup.Filiup.dto.teacher;

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
public class SectionLeaderboardResponse {
    private UUID sectionId;
    private String sectionName;
    private String gradeLevel;
    private List<StudentRankingResponse> students;
}
