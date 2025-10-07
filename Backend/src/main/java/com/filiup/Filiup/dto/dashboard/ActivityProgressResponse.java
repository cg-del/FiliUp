package com.filiup.Filiup.dto.dashboard;

import com.filiup.Filiup.entity.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityProgressResponse {
    private UUID id;
    private ActivityType activityType;
    private String title;
    private Integer orderIndex;
    private String status; // "locked", "unlocked", "completed"
    private Integer score;
    private BigDecimal percentage;
    private Boolean isUnlocked;
    private Boolean isCompleted;
}
