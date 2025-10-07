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
public class TeacherSectionResponse {
    private UUID id;
    private String name;
    private String gradeLevel;
    private Integer totalStudents;
    private Integer activeStudents;
    private Double averageProgress;
    private String inviteCode;
    private String status;
}
