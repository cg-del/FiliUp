package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Lesson;
import com.filiup.Filiup.entity.Phase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByPhaseOrderByOrderIndexAsc(Phase phase);
    
    List<Lesson> findAllByOrderByOrderIndexAsc();
    
    @Query("SELECT MAX(l.orderIndex) FROM Lesson l WHERE l.phase.id = :phaseId")
    Integer findMaxOrderIndexByPhase(@Param("phaseId") UUID phaseId);
}
