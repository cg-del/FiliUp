package edu.cit.filiup.service;

import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    @Autowired
    public ClassService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    // Create
    @Transactional
    public ClassEntity createClass(ClassEntity classEntity, int teacherId) {
        UserEntity teacher = userRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!"TEACHER".equals(teacher.getUserRole())) {
            throw new RuntimeException("User is not a teacher");
        }

        if (classRepository.existsByClassNameAndTeacherUserId(classEntity.getClassName(), teacherId)) {
            throw new RuntimeException("Class with this name already exists for this teacher");
        }

        classEntity.setTeacher(teacher);
        return classRepository.save(classEntity);
    }

    // Read
    public List<ClassEntity> getAllClasses() {
        return classRepository.findByIsActiveTrue();
    }

    public Optional<ClassEntity> getClassById(Long classId) {
        return classRepository.findById(classId);
    }

    public List<ClassEntity> getClassesByTeacher(int teacherId) {
        return classRepository.findByTeacherUserId(teacherId);
    }

    public List<ClassEntity> getClassesByStudent(int studentId) {
        return classRepository.findByStudentsUserId(studentId);
    }

    // Update
    @Transactional
    public ClassEntity updateClass(Long classId, ClassEntity updatedClass) {
        ClassEntity existingClass = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setDescription(updatedClass.getDescription());
        existingClass.setIsActive(updatedClass.getIsActive());

        return classRepository.save(existingClass);
    }

    // Delete
    @Transactional
    public void deleteClass(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        classEntity.setIsActive(false);
        classRepository.save(classEntity);
    }

    // Student Management
    @Transactional
    public ClassEntity addStudentToClass(Long classId, int studentId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        UserEntity student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!"STUDENT".equals(student.getUserRole())) {
            throw new RuntimeException("User is not a student");
        }

        classEntity.addStudent(student);
        return classRepository.save(classEntity);
    }

    @Transactional
    public ClassEntity removeStudentFromClass(Long classId, int studentId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        UserEntity student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        classEntity.removeStudent(student);
        return classRepository.save(classEntity);
    }
}
