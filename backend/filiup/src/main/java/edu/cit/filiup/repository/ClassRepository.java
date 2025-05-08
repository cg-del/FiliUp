package edu.cit.filiup.repository;

import edu.cit.filiup.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByTeacherUserId(int teacherId);
    List<ClassEntity> findByStudentsUserId(int studentId);
    List<ClassEntity> findByIsActiveTrue();
    boolean existsByClassNameAndTeacherUserId(String className, int teacherId);
    boolean existsByClassCode(String classCode);
}
