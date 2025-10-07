package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.StudentAchievement;
import com.filiup.Filiup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentAchievementRepository extends JpaRepository<StudentAchievement, UUID> {
    List<StudentAchievement> findByStudent(User student);
    boolean existsByStudentAndAchievementType(User student, String achievementType);
}
