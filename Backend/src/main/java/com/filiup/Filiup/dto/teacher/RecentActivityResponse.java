package com.filiup.Filiup.dto.teacher;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityResponse {
    private UUID studentId;
    private String studentName;
    private String activity;
    private Integer score;
    private LocalDateTime timestamp;
    private String timeAgo;
}
