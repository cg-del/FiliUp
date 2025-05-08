package edu.cit.filiup.service;

import edu.cit.filiup.entity.LeaderboardEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.LeaderboardRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;
    private final UserRepository userRepository;

    @Autowired
    public LeaderboardService(LeaderboardRepository leaderboardRepository, UserRepository userRepository) {
        this.leaderboardRepository = leaderboardRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LeaderboardEntity createLeaderboardEntry(LeaderboardEntity leaderboardEntity, int studentId) {
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        if (!"STUDENT".equals(student.getUserRole())) {
            throw new RuntimeException("Only students can have leaderboard entries");
        }

        leaderboardEntity.setStudent(student);
        leaderboardEntity.setLastUpdated(LocalDateTime.now());
        return leaderboardRepository.save(leaderboardEntity);
    }

    public List<LeaderboardEntity> getAllLeaderboardEntries() {
        return leaderboardRepository.findAll();
    }

    public Optional<LeaderboardEntity> getLeaderboardEntryById(Long entryId) {
        return leaderboardRepository.findById(entryId);
    }

    public List<LeaderboardEntity> getStudentLeaderboardEntries(int studentId) {
        return leaderboardRepository.findByStudentUserId(studentId);
    }

    public List<LeaderboardEntity> getLeaderboardByCategory(LeaderboardEntity.Category category) {
        return leaderboardRepository.findByCategory(category);
    }

    public List<LeaderboardEntity> getLeaderboardByTimeFrame(LeaderboardEntity.TimeFrame timeFrame) {
        return leaderboardRepository.findByTimeFrame(timeFrame);
    }

    public List<LeaderboardEntity> getLeaderboardByCategoryAndTimeFrame(
            LeaderboardEntity.Category category,
            LeaderboardEntity.TimeFrame timeFrame) {
        return leaderboardRepository.findByCategoryAndTimeFrame(category, timeFrame);
    }

    @Transactional
    public LeaderboardEntity updateLeaderboardEntry(Long entryId, LeaderboardEntity updatedEntry) {
        return leaderboardRepository.findById(entryId)
                .map(existingEntry -> {
                    existingEntry.setScore(updatedEntry.getScore());
                    existingEntry.setRank(updatedEntry.getRank());
                    existingEntry.setCategory(updatedEntry.getCategory());
                    existingEntry.setTimeFrame(updatedEntry.getTimeFrame());
                    existingEntry.setLastUpdated(LocalDateTime.now());
                    return leaderboardRepository.save(existingEntry);
                })
                .orElseThrow(() -> new RuntimeException("Leaderboard entry not found"));
    }

    @Transactional
    public void deleteLeaderboardEntry(Long entryId) {
        leaderboardRepository.deleteById(entryId);
    }

    @Transactional
    public void updateRanks(LeaderboardEntity.Category category, LeaderboardEntity.TimeFrame timeFrame) {
        List<LeaderboardEntity> entries = leaderboardRepository.findByCategoryAndTimeFrame(category, timeFrame);
        
        // Sort entries by score in descending order
        entries.sort((a, b) -> b.getScore().compareTo(a.getScore()));
        
        // Update ranks
        for (int i = 0; i < entries.size(); i++) {
            LeaderboardEntity entry = entries.get(i);
            entry.setRank(i + 1);
            entry.setLastUpdated(LocalDateTime.now());
            leaderboardRepository.save(entry);
        }
    }
}
