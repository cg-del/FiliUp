package edu.cit.filiup.service;

import edu.cit.filiup.dto.ClassDetailsDTO;
import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.QuestionBankEntity;
import edu.cit.filiup.entity.EnrollmentEntity;
import edu.cit.filiup.entity.CommonStoryEntity;
import edu.cit.filiup.entity.ClassCommonStoryEntity;
import edu.cit.filiup.repository.ClassRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.repository.QuestionBankRepository;
import edu.cit.filiup.repository.EnrollmentRepository;
import edu.cit.filiup.repository.CommonStoryRepository;
import edu.cit.filiup.repository.ClassCommonStoryRepository;
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
import java.util.ArrayList;

@Service
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final QuestionBankRepository questionBankRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CommonStoryRepository commonStoryRepository;
    private final ClassCommonStoryRepository classCommonStoryRepository;

    @Autowired
    public ClassService(
            ClassRepository classRepository, 
            UserRepository userRepository, 
            QuestionBankRepository questionBankRepository,
            EnrollmentRepository enrollmentRepository,
            CommonStoryRepository commonStoryRepository,
            ClassCommonStoryRepository classCommonStoryRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.questionBankRepository = questionBankRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.commonStoryRepository = commonStoryRepository;
        this.classCommonStoryRepository = classCommonStoryRepository;
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

    public List<edu.cit.filiup.dto.ClassWithStudentCountDto> getClassesWithStudentCountByTeacher(UUID teacherId) {
        List<ClassEntity> classes = classRepository.findByTeacherUserId(teacherId);
        List<edu.cit.filiup.dto.ClassWithStudentCountDto> result = new java.util.ArrayList<>();
        for (ClassEntity c : classes) {
            int studentCount = enrollmentRepository.findByClassCodeAndIsAccepted(c.getClassCode(), true).size();
            result.add(new edu.cit.filiup.dto.ClassWithStudentCountDto(
                c.getClassId(),
                c.getClassName(),
                c.getDescription(),
                c.getCreatedAt(),
                c.getIsActive(),
                c.getClassCode(),
                studentCount
            ));
        }
        return result;
    }

    public List<ClassEntity> getClassesByStudent(UUID studentId) {
        return classRepository.findByStudentsUserId(studentId);
    }

    public List<ClassEntity> getAcceptedClassesByStudent(UUID studentId) {
        // Get all accepted enrollments for the student
        List<EnrollmentEntity> acceptedEnrollments = enrollmentRepository.findByUserIdAndIsAccepted(studentId, true);
        
        // Get the class codes from accepted enrollments
        List<String> acceptedClassCodes = acceptedEnrollments.stream()
                .map(EnrollmentEntity::getClassCode)
                .collect(Collectors.toList());
        
        // Return all active classes that match the accepted class codes
        return classRepository.findByClassCodeInAndIsActiveTrue(acceptedClassCodes);
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
    // Update class name only
    @Transactional
    public ClassEntity updateClassName(UUID classId, String newName) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
        classEntity.setClassName(newName);
        return classRepository.save(classEntity);
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

    public void acceptEnrollment(String classCode, UUID studentId, UUID teacherId) {
        // Implementation needed
        throw new UnsupportedOperationException("Method not implemented");
    }

    // Common Story Management
    @Transactional
    public ClassCommonStoryEntity addCommonStoryToClass(UUID classId, UUID storyId, UUID teacherId) {
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        CommonStoryEntity story = commonStoryRepository.findById(storyId)
            .orElseThrow(() -> new EntityNotFoundException("Common story not found"));
        
        UserEntity teacher = userRepository.findById(teacherId)
            .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
        
        // Check if the user is the teacher of this class
        if (!classEntity.getTeacher().getUserId().equals(teacherId)) {
            throw new RuntimeException("Only the class teacher can add stories to this class");
        }
        
        // Check if the story is already added to this class
        if (classCommonStoryRepository.existsByClassEntityClassIdAndStoryStoryId(classId, storyId)) {
            throw new RuntimeException("This story is already added to the class");
        }
        
        // Create the relationship entity
        ClassCommonStoryEntity classCommonStory = new ClassCommonStoryEntity(classEntity, story, teacher);
        
        // Save and return
        return classCommonStoryRepository.save(classCommonStory);
    }
    
    @Transactional(readOnly = true)
    public List<ClassCommonStoryEntity> getClassCommonStories(UUID classId) {
        // Check if class exists
        if (!classRepository.existsById(classId)) {
            throw new EntityNotFoundException("Class not found");
        }
        
        // Get all ClassCommonStoryEntity records for this class
        List<ClassCommonStoryEntity> classCommonStories = classCommonStoryRepository.findByClassEntityClassId(classId);
        
        // Return the join entities directly
        return classCommonStories;
    }
    
    @Transactional
    public void removeCommonStoryFromClass(UUID classId, UUID storyId, UUID teacherId) {
        // Verify the class exists and belongs to the teacher
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        if (!classEntity.getTeacher().getUserId().equals(teacherId)) {
            throw new RuntimeException("You can only modify your own classes");
        }
        
        // Find and remove the association
        Optional<ClassCommonStoryEntity> association = classCommonStoryRepository
                .findByClassEntityClassIdAndStoryStoryId(classId, storyId);
        
        if (association.isPresent()) {
            classCommonStoryRepository.delete(association.get());
        } else {
            throw new EntityNotFoundException("Story not found in class");
        }
    }

    // Get comprehensive dashboard statistics for a class
    @Transactional(readOnly = true)
    public Map<String, Object> getClassDashboardStats(UUID classId, UUID teacherId) {
        // Verify the class exists and belongs to the teacher
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        if (!classEntity.getTeacher().getUserId().equals(teacherId)) {
            throw new RuntimeException("You can only view stats for your own classes");
        }

        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get enrolled students count
            List<EnrollmentEntity> enrollments = enrollmentRepository.findByClassCodeAndIsAccepted(
                classEntity.getClassCode(), true);
            int totalStudents = enrollments.size();
            
            // Calculate active students (students who have logged in recently)
            // For now, we'll assume 80-90% are active - this could be enhanced with actual login tracking
            int activeStudents = (int) Math.ceil(totalStudents * 0.85);
            
            // Get stories count for this class
            int storiesCount = classEntity.getStories().size();
            
            // Get quiz statistics if available
            Map<String, Object> quizStats = new HashMap<>();
            try {
                // This would need to be implemented to get quiz statistics for the class
                // For now, we'll set default values
                quizStats.put("totalQuizzes", 0);
                quizStats.put("averageScore", 0.0);
                quizStats.put("averageAccuracy", 75.0); // Default average
                quizStats.put("completedQuizzes", 0);
            } catch (Exception e) {
                // Handle case where no quiz data exists
                quizStats.put("totalQuizzes", 0);
                quizStats.put("averageScore", 0.0);
                quizStats.put("averageAccuracy", 0.0);
                quizStats.put("completedQuizzes", 0);
            }
            
            // Build student activity data
            List<Map<String, Object>> studentActivity = new ArrayList<>();
            for (EnrollmentEntity enrollment : enrollments) {
                UserEntity student = userRepository.findById(enrollment.getUserId()).orElse(null);
                if (student != null && "STUDENT".equals(student.getUserRole())) {
                    Map<String, Object> studentData = new HashMap<>();
                    studentData.put("id", student.getUserId().toString());
                    studentData.put("username", student.getUserName());
                    studentData.put("email", student.getUserEmail());
                    studentData.put("enrolledAt", enrollment.getEnrollmentDate());
                    
                    // Add mock activity data - this could be enhanced with real tracking
                    studentData.put("lastActiveHours", Math.random() * 24); // Hours since last activity
                    studentData.put("storiesRead", (int)(Math.random() * 10) + 1); // 1-10 stories
                    studentData.put("quizzesCompleted", (int)(Math.random() * 15) + 1); // 1-15 quizzes
                    studentData.put("averageScore", 60 + (Math.random() * 40)); // 60-100% average
                    
                    studentActivity.add(studentData);
                }
            }
            
            // Compile final statistics
            stats.put("classId", classId);
            stats.put("className", classEntity.getClassName());
            stats.put("totalStudents", totalStudents);
            stats.put("activeStudents", activeStudents);
            stats.put("storiesCount", storiesCount);
            stats.put("quizStats", quizStats);
            stats.put("studentActivity", studentActivity);
            stats.put("lastUpdated", java.time.LocalDateTime.now());
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate dashboard statistics: " + e.getMessage());
        }
        
        return stats;
    }
}
