package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Activity;
import com.filiup.Filiup.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {
    List<Question> findByActivityOrderByOrderIndexAsc(Activity activity);
    List<Question> findByActivityIdOrderByOrderIndexAsc(UUID activityId);
    
    @Modifying
    @Transactional
    void deleteByActivity(Activity activity);
}
