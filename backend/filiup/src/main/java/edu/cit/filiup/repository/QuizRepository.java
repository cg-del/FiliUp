package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, UUID> {
    List<QuizEntity> findByStoryStoryId(UUID storyId);
    List<QuizEntity> findByCreatedByUserId(UUID userId);
    List<QuizEntity> findByIsActiveTrue();
} 