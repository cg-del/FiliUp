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
public class DragDropCategoryResponse {
    private UUID id;
    private String categoryId;
    private String name;
    private String colorClass;
    private Integer orderIndex;
}
