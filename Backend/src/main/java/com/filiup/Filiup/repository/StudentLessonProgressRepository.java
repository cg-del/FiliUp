package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Lesson;
import com.filiup.Filiup.entity.StudentLessonProgress;
import com.filiup.Filiup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentLessonProgressRepository extends JpaRepository<StudentLessonProgress, UUID> {
    Optional<StudentLessonProgress> findByStudentAndLesson(User student, Lesson lesson);
    List<StudentLessonProgress> findByStudent(User student);
    List<StudentLessonProgress> findByLesson(Lesson lesson);
    
    // Additional methods for teacher functionality
    int countByStudentId(UUID studentId);
    int countByStudentIdAndIsCompleted(UUID studentId, boolean isCompleted);
    
    // Methods for student dashboard
    List<StudentLessonProgress> findByStudentId(UUID studentId);
}
