package edu.cit.filiup.controller;

import edu.cit.filiup.entity.QuestionEntity;
import edu.cit.filiup.entity.AnswerEntity;
import edu.cit.filiup.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {
    private final QuestionService questionService;

    @Autowired
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // Create a new question
    @PostMapping
    public ResponseEntity<QuestionEntity> createQuestion(
            @RequestBody QuestionEntity questionEntity,
            @RequestParam Long quizId) {
        try {
            QuestionEntity createdQuestion = questionService.createQuestion(questionEntity, quizId);
            return ResponseEntity.ok(createdQuestion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get questions by quiz
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuestionEntity>> getQuestionsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionService.getQuestionsByQuiz(quizId));
    }

    // Get question by ID
    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionEntity> getQuestionById(@PathVariable Long questionId) {
        return questionService.getQuestionById(questionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get questions by type
    @GetMapping("/type/{questionType}")
    public ResponseEntity<List<QuestionEntity>> getQuestionsByType(
            @PathVariable QuestionEntity.QuestionType questionType) {
        return ResponseEntity.ok(questionService.getQuestionsByType(questionType));
    }

    // Get questions by quiz and type
    @GetMapping("/quiz/{quizId}/type/{questionType}")
    public ResponseEntity<List<QuestionEntity>> getQuestionsByQuizAndType(
            @PathVariable Long quizId,
            @PathVariable QuestionEntity.QuestionType questionType) {
        return ResponseEntity.ok(questionService.getQuestionsByQuizAndType(quizId, questionType));
    }

    // Get questions by points
    @GetMapping("/points/{points}")
    public ResponseEntity<List<QuestionEntity>> getQuestionsByPoints(@PathVariable Integer points) {
        return ResponseEntity.ok(questionService.getQuestionsByPoints(points));
    }

    // Update question
    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionEntity> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody QuestionEntity updatedQuestion) {
        try {
            QuestionEntity updated = questionService.updateQuestion(questionId, updatedQuestion);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete question
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        try {
            questionService.deleteQuestion(questionId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Add answer to question
    @PostMapping("/{questionId}/answers")
    public ResponseEntity<QuestionEntity> addAnswerToQuestion(
            @PathVariable Long questionId,
            @RequestBody AnswerEntity answer) {
        try {
            QuestionEntity updatedQuestion = questionService.addAnswerToQuestion(questionId, answer);
            return ResponseEntity.ok(updatedQuestion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Remove answer from question
    @DeleteMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<QuestionEntity> removeAnswerFromQuestion(
            @PathVariable Long questionId,
            @PathVariable Long answerId) {
        try {
            QuestionEntity updatedQuestion = questionService.removeAnswerFromQuestion(questionId, answerId);
            return ResponseEntity.ok(updatedQuestion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update answer
    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<QuestionEntity> updateAnswer(
            @PathVariable Long questionId,
            @PathVariable Long answerId,
            @RequestBody AnswerEntity updatedAnswer) {
        try {
            QuestionEntity updatedQuestion = questionService.updateAnswer(questionId, answerId, updatedAnswer);
            return ResponseEntity.ok(updatedQuestion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 