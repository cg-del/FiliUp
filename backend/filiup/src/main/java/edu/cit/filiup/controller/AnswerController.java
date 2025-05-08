package edu.cit.filiup.controller;

import edu.cit.filiup.entity.AnswerEntity;
import edu.cit.filiup.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "*")
public class AnswerController {
    private final AnswerService answerService;

    @Autowired
    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    // Create a new answer
    @PostMapping
    public ResponseEntity<AnswerEntity> createAnswer(
            @RequestBody AnswerEntity answerEntity,
            @RequestParam Long questionId) {
        try {
            AnswerEntity createdAnswer = answerService.createAnswer(answerEntity, questionId);
            return ResponseEntity.ok(createdAnswer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get answers by question
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<AnswerEntity>> getAnswersByQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.getAnswersByQuestion(questionId));
    }

    // Get answer by ID
    @GetMapping("/{answerId}")
    public ResponseEntity<AnswerEntity> getAnswerById(@PathVariable Long answerId) {
        return answerService.getAnswerById(answerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all correct answers
    @GetMapping("/correct")
    public ResponseEntity<List<AnswerEntity>> getCorrectAnswers() {
        return ResponseEntity.ok(answerService.getCorrectAnswers());
    }

    // Get correct answers by question
    @GetMapping("/question/{questionId}/correct")
    public ResponseEntity<List<AnswerEntity>> getCorrectAnswersByQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.getCorrectAnswersByQuestion(questionId));
    }

    // Search answers by text
    @GetMapping("/search")
    public ResponseEntity<List<AnswerEntity>> searchAnswersByText(@RequestParam String text) {
        return ResponseEntity.ok(answerService.searchAnswersByText(text));
    }

    // Update answer
    @PutMapping("/{answerId}")
    public ResponseEntity<AnswerEntity> updateAnswer(
            @PathVariable Long answerId,
            @RequestBody AnswerEntity updatedAnswer) {
        try {
            AnswerEntity updated = answerService.updateAnswer(answerId, updatedAnswer);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete answer
    @DeleteMapping("/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long answerId) {
        try {
            answerService.deleteAnswer(answerId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Toggle answer correctness
    @PutMapping("/{answerId}/toggle-correct")
    public ResponseEntity<AnswerEntity> toggleAnswerCorrectness(@PathVariable Long answerId) {
        try {
            AnswerEntity updated = answerService.toggleAnswerCorrectness(answerId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Validate single correct answer for a question
    @GetMapping("/question/{questionId}/validate")
    public ResponseEntity<Void> validateSingleCorrectAnswer(@PathVariable Long questionId) {
        try {
            answerService.validateSingleCorrectAnswer(questionId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 