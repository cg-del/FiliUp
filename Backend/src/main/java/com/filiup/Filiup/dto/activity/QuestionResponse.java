package com.filiup.Filiup.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private UUID id;
    private String questionText;
    private List<String> options;
    private Integer correctAnswerIndex;
    private String explanation;
    private Integer orderIndex;
}
