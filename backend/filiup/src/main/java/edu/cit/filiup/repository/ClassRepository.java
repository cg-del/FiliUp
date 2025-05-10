package edu.cit.filiup.repository;

import edu.cit.filiup.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByIsActiveTrue();
    List<ClassEntity> findByTeacherUserId(int teacherId);
    List<ClassEntity> findByStudentsUserId(int studentId);
    boolean existsByClassNameAndTeacherUserId(String className, int teacherId);
    boolean existsByClassCode(String classCode);
    Optional<ClassEntity> findByClassCode(String classCode);
}