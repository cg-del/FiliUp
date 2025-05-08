package edu.cit.filiup.repository;

import edu.cit.filiup.entity.AnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<AnswerEntity, Long> {
    List<AnswerEntity> findByQuestionQuestionId(Long questionId);
    List<AnswerEntity> findByIsCorrectTrue();
    List<AnswerEntity> findByQuestionQuestionIdAndIsCorrectTrue(Long questionId);
    List<AnswerEntity> findByAnswerTextContainingIgnoreCase(String text);
} 