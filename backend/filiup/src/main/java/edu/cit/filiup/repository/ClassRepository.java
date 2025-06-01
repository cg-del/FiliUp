package edu.cit.filiup.repository;

import edu.cit.filiup.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    List<ClassEntity> findByIsActiveTrue();
    List<ClassEntity> findByTeacherUserId(UUID teacherId);
    List<ClassEntity> findByStudentsUserId(UUID studentId);
    boolean existsByClassNameAndTeacherUserId(String className, UUID teacherId);
    boolean existsByClassCode(String classCode);
    Optional<ClassEntity> findByClassCode(String classCode);
}