package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, UUID> {
    List<QuizEntity> findByStoryStoryId(UUID storyId);
    List<QuizEntity> findByCreatedByUserId(UUID userId);
    List<QuizEntity> findByIsActiveTrue();
    
    List<QuizEntity> findByCommonStoryStoryId(UUID commonStoryId);
    List<QuizEntity> findByQuizType(QuizEntity.QuizType quizType);
    List<QuizEntity> findByQuizTypeAndIsActiveTrue(QuizEntity.QuizType quizType);
    
    @Query("SELECT q FROM QuizEntity q WHERE q.createdBy.userId = :userId AND q.quizType = :quizType")
    List<QuizEntity> findByCreatedByUserIdAndQuizType(@Param("userId") UUID userId, @Param("quizType") QuizEntity.QuizType quizType);
    
    @Query("SELECT q FROM QuizEntity q WHERE q.commonStory.storyId = :commonStoryId AND q.isActive = true")
    List<QuizEntity> findActiveQuizzesByCommonStoryId(@Param("commonStoryId") UUID commonStoryId);
    
    @Query("SELECT DISTINCT q FROM QuizEntity q " +
           "JOIN ClassCommonStoryEntity ccs ON q.commonStory.storyId = ccs.story.storyId " +
           "WHERE ccs.classEntity.classId = :classId AND q.isActive = true AND q.quizType = 'COMMON_STORY'")
    List<QuizEntity> findCommonStoryQuizzesByClassId(@Param("classId") UUID classId);
} 