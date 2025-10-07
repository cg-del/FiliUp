package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Lesson;
import com.filiup.Filiup.entity.LessonSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonSlideRepository extends JpaRepository<LessonSlide, UUID> {
    List<LessonSlide> findByLessonOrderByOrderIndexAsc(Lesson lesson);
    List<LessonSlide> findByLessonIdOrderByOrderIndexAsc(UUID lessonId);
    
    @Modifying
    @Transactional
    void deleteByLesson(Lesson lesson);
}
