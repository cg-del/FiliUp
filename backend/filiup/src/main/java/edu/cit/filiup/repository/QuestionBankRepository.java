package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuestionBankEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBankEntity, Long> {
    List<QuestionBankEntity> findByIsActiveTrue();
    List<QuestionBankEntity> findByCreatedByUserIdAndIsActiveTrue(Integer userId);
    List<QuestionBankEntity> findByStoryIdAndIsActiveTrue(Long storyId);
    List<QuestionBankEntity> findByStoryIdAndStoryTypeAndIsActiveTrue(Long storyId, String storyType);
} 