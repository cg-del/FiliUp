package edu.cit.filiup.repository;

import edu.cit.filiup.entity.StoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<StoryEntity, Long> {
    List<StoryEntity> findByClassEntityClassId(Long classId);
    List<StoryEntity> findByCreatedByUserId(int userId);
    List<StoryEntity> findByIsActiveTrue();
    List<StoryEntity> findByClassEntityClassIdAndIsActiveTrue(Long classId);
    List<StoryEntity> findByGenre(String genre);
}
