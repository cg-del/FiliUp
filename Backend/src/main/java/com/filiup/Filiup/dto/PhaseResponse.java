package com.filiup.Filiup.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PhaseResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer lessonsCount;
    private LocalDateTime createdAt;
}
