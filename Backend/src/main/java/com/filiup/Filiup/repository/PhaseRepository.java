package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Phase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PhaseRepository extends JpaRepository<Phase, UUID> {
    List<Phase> findAllByOrderByOrderIndexAsc();
    
    @Query("SELECT MAX(p.orderIndex) FROM Phase p")
    Integer findMaxOrderIndex();
    
    List<Phase> findByOrderIndexGreaterThanEqualOrderByOrderIndexAsc(Integer orderIndex);
    
    List<Phase> findByOrderIndexGreaterThanOrderByOrderIndexAsc(Integer orderIndex);
    
    @Modifying
    @Query("UPDATE Phase p SET p.orderIndex = p.orderIndex + 1 WHERE p.orderIndex BETWEEN :start AND :end")
    void shiftPhasesDown(@Param("start") Integer start, @Param("end") Integer end);
    
    @Modifying
    @Query("UPDATE Phase p SET p.orderIndex = p.orderIndex - 1 WHERE p.orderIndex BETWEEN :start AND :end")
    void shiftPhasesUp(@Param("start") Integer start, @Param("end") Integer end);
}
