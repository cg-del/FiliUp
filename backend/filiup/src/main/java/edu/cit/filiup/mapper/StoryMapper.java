package edu.cit.filiup.mapper;

import edu.cit.filiup.dto.StoryCreateDTO;
import edu.cit.filiup.dto.StoryResponseDTO;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class StoryMapper {
    
    public StoryEntity toEntity(StoryCreateDTO dto, ClassEntity classEntity, UserEntity createdBy) {
        StoryEntity entity = new StoryEntity();
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setGenre(dto.getGenre());
        if (dto.getFictionType() != null && !dto.getFictionType().trim().isEmpty()) {
            entity.setFictionType(dto.getFictionType());
        }
        entity.setCoverPictureUrl(dto.getCoverPictureUrl());
        entity.setCoverPictureType(dto.getCoverPictureType());
        entity.setClassEntity(classEntity);
        entity.setCreatedBy(createdBy);
        entity.setIsActive(true);
        return entity;
    }

    public StoryResponseDTO toResponseDTO(StoryEntity entity) {
        StoryResponseDTO dto = new StoryResponseDTO();
        dto.setStoryId(entity.getStoryId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setGenre(entity.getGenre());
        dto.setFictionType(entity.getFictionType());
        dto.setCoverPictureUrl(entity.getCoverPictureUrl());
        dto.setCoverPictureType(entity.getCoverPictureType());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setIsActive(entity.getIsActive());
        
        if (entity.getClassEntity() != null) {
            dto.setClassId(entity.getClassEntity().getClassId());
            dto.setClassName(entity.getClassEntity().getClassName());
        }
        
        if (entity.getCreatedBy() != null) {
            dto.setCreatedById(entity.getCreatedBy().getUserId());
            dto.setCreatedByName(entity.getCreatedBy().getUserName());
        }
        
        return dto;
    }
} 