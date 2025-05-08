package edu.cit.filiup.repository;

import edu.cit.filiup.entity.BadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<BadgeEntity, Long> {
    List<BadgeEntity> findByCreatedByUserId(int userId);
    List<BadgeEntity> findByIsActiveTrue();
    List<BadgeEntity> findByCreatedByUserIdAndIsActiveTrue(int userId);
    List<BadgeEntity> findByPointsValueGreaterThanEqual(Integer pointsValue);
    List<BadgeEntity> findByTitleContainingIgnoreCase(String title);
}
