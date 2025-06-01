package edu.cit.filiup.repository;

import edu.cit.filiup.entity.LeaderboardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaderboardRepository extends JpaRepository<LeaderboardEntity, UUID> {
    List<LeaderboardEntity> findByStudentUserId(UUID studentId);
    List<LeaderboardEntity> findByCategory(LeaderboardEntity.Category category);
    List<LeaderboardEntity> findByTimeFrame(LeaderboardEntity.TimeFrame timeFrame);
    List<LeaderboardEntity> findByCategoryAndTimeFrame(LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame);
    List<LeaderboardEntity> findByStudentUserIdAndCategory(UUID studentId, LeaderboardEntity.Category category);
    List<LeaderboardEntity> findByStudentUserIdAndTimeFrame(UUID studentId, LeaderboardEntity.TimeFrame timeFrame);
}
