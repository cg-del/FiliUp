package com.filiup.Filiup.dto.student;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterSectionRequest {
    
    @NotBlank(message = "Registration code is required")
    private String registrationCode;
}
