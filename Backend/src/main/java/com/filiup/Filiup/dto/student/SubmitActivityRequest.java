package com.filiup.Filiup.dto.student;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitActivityRequest {
    
    @NotNull(message = "Answers are required")
    private List<Object> answers;
    
    private Integer timeSpentSeconds;
}
