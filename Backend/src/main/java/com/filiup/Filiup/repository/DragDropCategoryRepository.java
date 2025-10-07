package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Activity;
import com.filiup.Filiup.entity.DragDropCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface DragDropCategoryRepository extends JpaRepository<DragDropCategory, UUID> {
    List<DragDropCategory> findByActivityOrderByOrderIndexAsc(Activity activity);
    List<DragDropCategory> findByActivityIdOrderByOrderIndexAsc(UUID activityId);
    
    @Modifying
    @Transactional
    void deleteByActivity(Activity activity);
}
