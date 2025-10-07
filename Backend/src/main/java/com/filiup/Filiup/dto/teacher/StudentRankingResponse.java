package com.filiup.Filiup.dto.teacher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRankingResponse {
    private UUID id;
    private String name;
    private Integer totalScore;
    private Integer lessonsCompleted;
    private Integer activitiesCompleted;
    private Double averageScore;
    private Integer rank;
}
