package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<QuestionEntity, Long> {
    List<QuestionEntity> findByQuizQuizId(Long quizId);
    List<QuestionEntity> findByQuestionType(QuestionEntity.QuestionType questionType);
    List<QuestionEntity> findByQuizQuizIdAndQuestionType(Long quizId, QuestionEntity.QuestionType questionType);
    List<QuestionEntity> findByPointsGreaterThanEqual(Integer points);
} 