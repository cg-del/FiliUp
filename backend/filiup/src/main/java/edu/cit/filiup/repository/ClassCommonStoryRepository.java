package edu.cit.filiup.repository;

import edu.cit.filiup.entity.ClassCommonStoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassCommonStoryRepository extends JpaRepository<ClassCommonStoryEntity, UUID> {
    
    List<ClassCommonStoryEntity> findByClassEntityClassId(UUID classId);
    
    Optional<ClassCommonStoryEntity> findByClassEntityClassIdAndStoryStoryId(UUID classId, UUID storyId);
    
    boolean existsByClassEntityClassIdAndStoryStoryId(UUID classId, UUID storyId);
    
    void deleteByClassEntityClassIdAndStoryStoryId(UUID classId, UUID storyId);
} 