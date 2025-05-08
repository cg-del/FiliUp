package edu.cit.filiup.controller;

import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ClassController {
    private final ClassService classService;

    @Autowired
    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    // Create a new class
    @PostMapping
    public ResponseEntity<ClassEntity> createClass(
            @RequestBody ClassEntity classEntity,
            @RequestParam int teacherId) {
        try {
            ClassEntity createdClass = classService.createClass(classEntity, teacherId);
            return ResponseEntity.ok(createdClass);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all active classes
    @GetMapping
    public ResponseEntity<List<ClassEntity>> getAllClasses() {
        return ResponseEntity.ok(classService.getAllClasses());
    }

    // Get class by ID
    @GetMapping("/{classId}")
    public ResponseEntity<ClassEntity> getClassById(@PathVariable Long classId) {
        return classService.getClassById(classId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get classes by teacher
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassEntity>> getClassesByTeacher(@PathVariable int teacherId) {
        return ResponseEntity.ok(classService.getClassesByTeacher(teacherId));
    }

    // Get classes by student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ClassEntity>> getClassesByStudent(@PathVariable int studentId) {
        return ResponseEntity.ok(classService.getClassesByStudent(studentId));
    }

    // Update class
    @PutMapping("/{classId}")
    public ResponseEntity<ClassEntity> updateClass(
            @PathVariable Long classId,
            @RequestBody ClassEntity updatedClass) {
        try {
            ClassEntity updated = classService.updateClass(classId, updatedClass);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete class (soft delete)
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long classId) {
        try {
            classService.deleteClass(classId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Add student to class
    @PostMapping("/{classId}/students/{studentId}")
    public ResponseEntity<ClassEntity> addStudentToClass(
            @PathVariable Long classId,
            @PathVariable int studentId) {
        try {
            ClassEntity updatedClass = classService.addStudentToClass(classId, studentId);
            return ResponseEntity.ok(updatedClass);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Remove student from class
    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<ClassEntity> removeStudentFromClass(
            @PathVariable Long classId,
            @PathVariable int studentId) {
        try {
            ClassEntity updatedClass = classService.removeStudentFromClass(classId, studentId);
            return ResponseEntity.ok(updatedClass);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{classId}/regenerate-code")
    public ResponseEntity<ClassEntity> regenerateClassCode(@PathVariable Long classId) {
        ClassEntity updatedClass = classService.regenerateClassCode(classId);
        return ResponseEntity.ok(updatedClass);
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<List<UserEntity>> getStudentsByClass(@PathVariable Long classId) {
        return classService.getClassById(classId)
            .map(classEntity -> ResponseEntity.ok(classEntity.getStudents()))
            .orElse(ResponseEntity.notFound().build());
    }
}
