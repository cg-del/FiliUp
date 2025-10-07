package com.filiup.Filiup.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {
    private StudentInfoResponse student;
    private StudentStatsResponse stats;
    private List<PhaseResponse> phases;
}
