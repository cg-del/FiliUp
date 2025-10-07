package com.filiup.Filiup.dto.section;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSectionRequest {
    
    @NotBlank(message = "Section name is required")
    private String name;
    
    private String gradeLevel;
    
    private Integer capacity = 30;
}
