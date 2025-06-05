package edu.cit.filiup.repository;

import edu.cit.filiup.entity.BadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface BadgeRepository extends JpaRepository<BadgeEntity, UUID> {
    List<BadgeEntity> findByCreatedByUserId(UUID userId);
    List<BadgeEntity> findByIsActiveTrue();
    List<BadgeEntity> findByCreatedByUserIdAndIsActiveTrue(UUID userId);
    List<BadgeEntity> findByPointsValueGreaterThanEqual(Integer pointsValue);
    List<BadgeEntity> findByTitleContainingIgnoreCase(String title);
}
