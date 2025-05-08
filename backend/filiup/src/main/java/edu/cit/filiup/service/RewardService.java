package edu.cit.filiup.service;

import edu.cit.filiup.entity.BadgeEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.BadgeRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RewardService {
    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;

    @Autowired
    public RewardService(BadgeRepository badgeRepository, UserRepository userRepository) {
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BadgeEntity createBadge(BadgeEntity badgeEntity, int userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"TEACHER".equals(user.getUserRole())) {
            throw new RuntimeException("Only teachers can create badges");
        }

        badgeEntity.setCreatedBy(user);
        badgeEntity.setIsActive(true);
        return badgeRepository.save(badgeEntity);
    }

    public List<BadgeEntity> getAllBadges() {
        return badgeRepository.findByIsActiveTrue();
    }

    public Optional<BadgeEntity> getBadgeById(Long badgeId) {
        return badgeRepository.findById(badgeId)
                .filter(BadgeEntity::getIsActive);
    }

    public List<BadgeEntity> getBadgesByTeacher(int userId) {
        return badgeRepository.findByCreatedByUserIdAndIsActiveTrue(userId);
    }

    public List<BadgeEntity> getBadgesByPointsValue(Integer pointsValue) {
        return badgeRepository.findByPointsValueGreaterThanEqual(pointsValue);
    }

    public List<BadgeEntity> searchBadgesByTitle(String title) {
        return badgeRepository.findByTitleContainingIgnoreCase(title);
    }

    @Transactional
    public BadgeEntity updateBadge(Long badgeId, BadgeEntity updatedBadge) {
        return badgeRepository.findById(badgeId)
                .filter(BadgeEntity::getIsActive)
                .map(existingBadge -> {
                    existingBadge.setTitle(updatedBadge.getTitle());
                    existingBadge.setDescription(updatedBadge.getDescription());
                    existingBadge.setCriteria(updatedBadge.getCriteria());
                    existingBadge.setPointsValue(updatedBadge.getPointsValue());
                    existingBadge.setImageUrl(updatedBadge.getImageUrl());
                    return badgeRepository.save(existingBadge);
                })
                .orElseThrow(() -> new RuntimeException("Badge not found"));
    }

    @Transactional
    public void deleteBadge(Long badgeId) {
        badgeRepository.findById(badgeId)
                .filter(BadgeEntity::getIsActive)
                .ifPresent(badge -> {
                    badge.setIsActive(false);
                    badgeRepository.save(badge);
                });
    }

    @Transactional
    public void awardBadgeToStudent(Long badgeId, int studentId) {
        BadgeEntity badge = badgeRepository.findById(badgeId)
                .filter(BadgeEntity::getIsActive)
                .orElseThrow(() -> new RuntimeException("Badge not found"));

        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!"STUDENT".equals(student.getUserRole())) {
            throw new RuntimeException("Badges can only be awarded to students");
        }

        // Here you would implement the logic to associate the badge with the student
        // This might involve creating a new entity for tracking student badges
        // For now, we'll just throw an exception
        throw new RuntimeException("Badge awarding functionality not implemented yet");
    }
}
