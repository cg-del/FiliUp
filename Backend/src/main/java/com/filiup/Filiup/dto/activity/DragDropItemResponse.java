package com.filiup.Filiup.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DragDropItemResponse {
    private UUID id;
    private String text;
    private String correctCategory;
    private Integer orderIndex;
}
