package edu.cit.filiup.service;

import edu.cit.filiup.dto.ClassDetailsDTO;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.QuestionBankEntity;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.QuestionBankRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final QuestionBankRepository questionBankRepository;

    @Autowired
    public ClassService(ClassRepository classRepository, UserRepository userRepository, QuestionBankRepository questionBankRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.questionBankRepository = questionBankRepository;
    }

    // Create
    @Transactional
    public ClassEntity createClass(ClassEntity classEntity, UUID teacherId) {
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

    public Optional<ClassEntity> getClassById(UUID classId) {
        return classRepository.findById(classId);
    }

    public List<ClassEntity> getClassesByTeacher(UUID teacherId) {
        return classRepository.findByTeacherUserId(teacherId);
    }

    public List<ClassEntity> getClassesByStudent(UUID studentId) {
        return classRepository.findByStudentsUserId(studentId);
    }

    @Transactional(readOnly = true)
    public Map<String, String> getClassTeacher(UUID classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));

        UserEntity teacher = classEntity.getTeacher();
        Map<String, String> response = new HashMap<>();
        
        if (teacher != null) {
            response.put("teacherName", teacher.getUserName());
            response.put("teacherId", String.valueOf(teacher.getUserId()));
        } else {
            response.put("teacherName", "Not Assigned");
            response.put("teacherId", null);
        }

        return response;
    }

    // Update
    @Transactional
    public ClassEntity updateClass(UUID classId, ClassEntity updatedClass) {
        ClassEntity existingClass = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setDescription(updatedClass.getDescription());
        existingClass.setIsActive(updatedClass.getIsActive());

        return classRepository.save(existingClass);
    }

    // Delete
    @Transactional
    public void deleteClass(UUID classId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        // Remove all associations first
        classEntity.getStudents().clear();
        classEntity.getStories().clear();
        
        // Delete the class
        classRepository.delete(classEntity);
    }

    // Student Management
    @Transactional
    public ClassEntity addStudentToClass(UUID classId, UUID studentId) {
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
    public ClassEntity removeStudentFromClass(UUID classId, UUID studentId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        UserEntity student = userRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        classEntity.removeStudent(student);
        return classRepository.save(classEntity);
    }

    @Transactional
    public ClassEntity regenerateClassCode(UUID classId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

        String newCode;
        do {
            newCode = generateClassCode();
        } while (classRepository.existsByClassCode(newCode));

        classEntity.setClassCode(newCode);
        classRepository.save(classEntity);
        return classEntity;
    }

    private String generateClassCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public ClassDetailsDTO getClassDetailsById(UUID classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));

        ClassDetailsDTO dto = ClassDetailsDTO.fromEntity(classEntity);

        // Add students
        List<ClassDetailsDTO.UserDTO> studentDTOs = classEntity.getStudents().stream()
                .map(ClassDetailsDTO.UserDTO::fromEntity)
                .collect(Collectors.toList());
        dto.setStudents(studentDTOs);

        // Add stories with their questions
        List<ClassDetailsDTO.StoryDTO> storyDTOs = classEntity.getStories().stream()
                .map(story -> {
                    ClassDetailsDTO.StoryDTO storyDTO = ClassDetailsDTO.StoryDTO.fromEntity(story);
                    
                    // Get questions for this story
                    List<QuestionBankEntity> questions = questionBankRepository
                        .findByStoryIdAndStoryTypeAndIsActiveTrue(story.getStoryId(), QuestionBankEntity.StoryType.CLASS);
                    
                    List<ClassDetailsDTO.QuestionDTO> questionDTOs = questions.stream()
                        .map(ClassDetailsDTO.QuestionDTO::fromEntity)
                        .collect(Collectors.toList());
                    
                    storyDTO.setQuestions(questionDTOs);
                    return storyDTO;
                })
                .collect(Collectors.toList());
        dto.setStories(storyDTOs);

        return dto;
    }
}
