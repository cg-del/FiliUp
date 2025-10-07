package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Activity;
import com.filiup.Filiup.entity.DragDropItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface DragDropItemRepository extends JpaRepository<DragDropItem, UUID> {
    List<DragDropItem> findByActivityOrderByOrderIndexAsc(Activity activity);
    List<DragDropItem> findByActivityIdOrderByOrderIndexAsc(UUID activityId);
    
    @Modifying
    @Transactional
    void deleteByActivity(Activity activity);
}
