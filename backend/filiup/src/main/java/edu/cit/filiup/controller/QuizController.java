package edu.cit.filiup.controller;

import edu.cit.filiup.entity.QuizEntity;
import edu.cit.filiup.entity.QuestionEntity;
import edu.cit.filiup.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {
    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Create a new quiz
    @PostMapping
    public ResponseEntity<QuizEntity> createQuiz(
            @RequestBody QuizEntity quizEntity,
            @RequestParam int userId) {
        try {
            QuizEntity createdQuiz = quizService.createQuiz(quizEntity, userId);
            return ResponseEntity.ok(createdQuiz);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all active quizzes
    @GetMapping
    public ResponseEntity<List<QuizEntity>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // Get quiz by ID
    @GetMapping("/{quizId}")
    public ResponseEntity<QuizEntity> getQuizById(@PathVariable Long quizId) {
        return quizService.getQuizById(quizId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get quizzes by teacher
    @GetMapping("/teacher/{userId}")
    public ResponseEntity<List<QuizEntity>> getQuizzesByTeacher(@PathVariable int userId) {
        return ResponseEntity.ok(quizService.getQuizzesByTeacher(userId));
    }

    // Get quizzes by difficulty level
    @GetMapping("/difficulty/{difficultyLevel}")
    public ResponseEntity<List<QuizEntity>> getQuizzesByDifficulty(
            @PathVariable QuizEntity.DifficultyLevel difficultyLevel) {
        return ResponseEntity.ok(quizService.getQuizzesByDifficulty(difficultyLevel));
    }

    // Get quizzes by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<QuizEntity>> getQuizzesByCategory(
            @PathVariable QuizEntity.QuizCategory category) {
        return ResponseEntity.ok(quizService.getQuizzesByCategory(category));
    }

    // Update quiz
    @PutMapping("/{quizId}")
    public ResponseEntity<QuizEntity> updateQuiz(
            @PathVariable Long quizId,
            @RequestBody QuizEntity updatedQuiz) {
        try {
            QuizEntity updated = quizService.updateQuiz(quizId, updatedQuiz);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete quiz (soft delete)
    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        try {
            quizService.deleteQuiz(quizId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Add question to quiz
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<QuizEntity> addQuestionToQuiz(
            @PathVariable Long quizId,
            @RequestBody QuestionEntity question) {
        try {
            QuizEntity updatedQuiz = quizService.addQuestionToQuiz(quizId, question);
            return ResponseEntity.ok(updatedQuiz);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Remove question from quiz
    @DeleteMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<QuizEntity> removeQuestionFromQuiz(
            @PathVariable Long quizId,
            @PathVariable Long questionId) {
        try {
            QuizEntity updatedQuiz = quizService.removeQuestionFromQuiz(quizId, questionId);
            return ResponseEntity.ok(updatedQuiz);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
