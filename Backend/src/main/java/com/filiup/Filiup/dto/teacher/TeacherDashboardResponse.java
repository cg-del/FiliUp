package com.filiup.Filiup.dto.teacher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardResponse {
    private TeacherStatsResponse stats;
    private List<TeacherSectionResponse> sections;
    private List<RecentActivityResponse> recentActivity;
}
