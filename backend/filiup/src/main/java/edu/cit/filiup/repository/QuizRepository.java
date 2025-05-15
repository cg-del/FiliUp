package edu.cit.filiup.repository;

import edu.cit.filiup.entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<QuizEntity, Long> {
    List<QuizEntity> findByCreatedByUserId(int userId);
    List<QuizEntity> findByIsActiveTrue();
    List<QuizEntity> findByCreatedByUserIdAndIsActiveTrue(int userId);
}
