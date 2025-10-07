package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Activity;
import com.filiup.Filiup.entity.MatchingPair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface MatchingPairRepository extends JpaRepository<MatchingPair, UUID> {
    List<MatchingPair> findByActivityOrderByOrderIndexAsc(Activity activity);
    List<MatchingPair> findByActivityIdOrderByOrderIndexAsc(UUID activityId);
    
    @Modifying
    @Transactional
    void deleteByActivity(Activity activity);
}
