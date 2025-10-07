package com.filiup.Filiup.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentInfoResponse {
    private String id;
    private String name;
    private String email;
    private String sectionName;
}
