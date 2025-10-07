package com.filiup.Filiup.dto.student;

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
public class ActivitySubmissionResponse {
    private Integer score;
    private BigDecimal percentage;
    private Boolean isCompleted;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private NextActivity nextActivity;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NextActivity {
        private UUID id;
        private String type;
    }
}
