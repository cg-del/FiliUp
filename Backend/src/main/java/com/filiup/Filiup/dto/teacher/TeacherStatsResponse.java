package com.filiup.Filiup.dto.teacher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherStatsResponse {
    private Integer totalStudents;
    private Integer activeSections;
    private Double averageProgress;
    private Integer activitiesCreated;
}
