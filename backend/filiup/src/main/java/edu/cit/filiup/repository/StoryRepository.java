package edu.cit.filiup.repository;

import edu.cit.filiup.entity.StoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface StoryRepository extends JpaRepository<StoryEntity, UUID> {
    List<StoryEntity> findByClassEntityClassId(UUID classId);
    List<StoryEntity> findByCreatedByUserId(UUID userId);
    List<StoryEntity> findByIsActiveTrue();
    List<StoryEntity> findByClassEntityClassIdAndIsActiveTrue(UUID classId);
    List<StoryEntity> findByGenre(String genre);
    List<StoryEntity> findByFictionType(String fictionType);
    List<StoryEntity> findByFictionTypeAndIsActiveTrue(String fictionType);
    
    // Admin-specific repository methods
    StoryEntity findByStoryId(UUID storyId);
    List<StoryEntity> findByCreatedBy_UserId(UUID teacherId);
}
