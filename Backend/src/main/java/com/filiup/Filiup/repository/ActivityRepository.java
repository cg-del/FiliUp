package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Activity;
import com.filiup.Filiup.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByLessonOrderByOrderIndexAsc(Lesson lesson);
    
    List<Activity> findAllByOrderByOrderIndexAsc();
    
    @Query("SELECT MAX(a.orderIndex) FROM Activity a WHERE a.lesson.id = :lessonId")
    Integer findMaxOrderIndexByLesson(@Param("lessonId") UUID lessonId);
}
