package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuestionBankEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBankEntity, UUID> {
    List<QuestionBankEntity> findByIsActiveTrue();
    List<QuestionBankEntity> findByCreatedByUserIdAndIsActiveTrue(UUID teacherId);
    List<QuestionBankEntity> findByStoryIdAndIsActiveTrue(UUID storyId);
    List<QuestionBankEntity> findByStoryIdAndStoryTypeAndIsActiveTrue(UUID storyId, QuestionBankEntity.StoryType storyType);
} 