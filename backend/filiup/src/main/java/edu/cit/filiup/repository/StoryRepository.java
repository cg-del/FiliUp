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
}
