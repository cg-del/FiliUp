package edu.cit.filiup.repository;

import edu.cit.filiup.entity.LeaderboardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    // New methods for quiz-based leaderboards
    List<LeaderboardEntity> findByClassIdAndCategoryAndTimeFrameOrderByRankAsc(UUID classId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame);
    List<LeaderboardEntity> findByStoryIdAndCategoryAndTimeFrameOrderByRankAsc(UUID storyId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame);
    List<LeaderboardEntity> findByClassIdAndCategory(UUID classId, LeaderboardEntity.Category category);
    List<LeaderboardEntity> findByStoryIdAndCategory(UUID storyId, LeaderboardEntity.Category category);
    
    // Find existing leaderboard entry for update
    LeaderboardEntity findByStudentUserIdAndCategoryAndTimeFrameAndClassIdAndStoryId(
        UUID studentId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame, 
        UUID classId, UUID storyId);
    
    LeaderboardEntity findByStudentUserIdAndCategoryAndTimeFrameAndClassId(
        UUID studentId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame, UUID classId);
    
    LeaderboardEntity findByStudentUserIdAndCategoryAndTimeFrameAndStoryId(
        UUID studentId, LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame, UUID storyId);
    
    // Query for overall leaderboards
    @Query("SELECT l FROM LeaderboardEntity l WHERE l.category = :category AND l.timeFrame = :timeFrame ORDER BY l.rank ASC")
    List<LeaderboardEntity> findOverallLeaderboard(@Param("category") LeaderboardEntity.Category category, @Param("timeFrame") LeaderboardEntity.TimeFrame timeFrame);
    
    // Query for accuracy leaderboard
    @Query("SELECT l FROM LeaderboardEntity l WHERE l.category = 'QUIZ_ACCURACY' AND l.timeFrame = :timeFrame " +
           "AND (:classId IS NULL OR l.classId = :classId) ORDER BY l.accuracyPercentage DESC")
    List<LeaderboardEntity> findAccuracyLeaderboard(@Param("timeFrame") LeaderboardEntity.TimeFrame timeFrame, @Param("classId") UUID classId);
    
    // Query for speed leaderboard (fastest average completion time)
    @Query("SELECT l FROM LeaderboardEntity l WHERE l.category = 'QUIZ_SPEED' AND l.timeFrame = :timeFrame " +
           "AND (:classId IS NULL OR l.classId = :classId) ORDER BY l.averageTimeMinutes ASC")
    List<LeaderboardEntity> findSpeedLeaderboard(@Param("timeFrame") LeaderboardEntity.TimeFrame timeFrame, @Param("classId") UUID classId);
}
