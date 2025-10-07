package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Activity;
import com.filiup.Filiup.entity.StudentActivityAttempt;
import com.filiup.Filiup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentActivityAttemptRepository extends JpaRepository<StudentActivityAttempt, UUID> {
    List<StudentActivityAttempt> findByStudent(User student);
    List<StudentActivityAttempt> findByActivity(Activity activity);
    
    @Query("SELECT s FROM StudentActivityAttempt s WHERE s.student = :student AND s.activity = :activity ORDER BY s.createdAt DESC")
    List<StudentActivityAttempt> findByStudentAndActivityOrderByCreatedAtDesc(User student, Activity activity);
    
    @Query("SELECT s FROM StudentActivityAttempt s WHERE s.student = :student AND s.activity = :activity ORDER BY s.percentage DESC")
    Optional<StudentActivityAttempt> findBestAttempt(User student, Activity activity);
    
    // Additional methods for teacher functionality
    List<StudentActivityAttempt> findByStudentId(UUID studentId);
    List<StudentActivityAttempt> findTop5ByStudentIdOrderByCreatedAtDesc(UUID studentId);
    int countByStudentId(UUID studentId);
    boolean existsByStudentIdAndCreatedAtAfter(UUID studentId, LocalDateTime dateTime);
    
    // Methods for student dashboard
    List<StudentActivityAttempt> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    
    // Get latest attempt for each activity (one per activity to avoid duplicates)
    @Query("SELECT a FROM StudentActivityAttempt a WHERE a.student.id = :studentId " +
           "AND a.createdAt = (SELECT MAX(a2.createdAt) FROM StudentActivityAttempt a2 " +
           "WHERE a2.student.id = :studentId AND a2.activity.id = a.activity.id)")
    List<StudentActivityAttempt> findBestAttemptsByStudentId(UUID studentId);
    
    // Find attempts by student and activity
    List<StudentActivityAttempt> findByStudentAndActivity(User student, Activity activity);
}
