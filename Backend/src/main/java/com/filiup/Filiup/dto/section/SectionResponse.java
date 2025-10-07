package com.filiup.Filiup.dto.section;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionResponse {
    private UUID id;
    private String name;
    private String gradeLevel;
    private String inviteCode;
    private Integer studentCount;
    private Integer activeStudents;
    private Double averageProgress;
}
