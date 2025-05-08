package edu.cit.filiup.repository;

import edu.cit.filiup.entity.LeaderboardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<LeaderboardEntity, Long> {
    List<LeaderboardEntity> findByStudentUserId(int studentId);
    List<LeaderboardEntity> findByCategory(LeaderboardEntity.Category category);
    List<LeaderboardEntity> findByTimeFrame(LeaderboardEntity.TimeFrame timeFrame);
    List<LeaderboardEntity> findByCategoryAndTimeFrame(LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame);
    List<LeaderboardEntity> findByStudentUserIdAndCategory(int studentId, LeaderboardEntity.Category category);
    List<LeaderboardEntity> findByStudentUserIdAndTimeFrame(int studentId, LeaderboardEntity.TimeFrame timeFrame);
}
