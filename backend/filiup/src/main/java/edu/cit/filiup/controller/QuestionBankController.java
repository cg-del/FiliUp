package edu.cit.filiup.controller;

import edu.cit.filiup.entity.QuestionBankEntity;
import edu.cit.filiup.service.QuestionBankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question-bank")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionBankController {

    @Autowired
    private QuestionBankService questionBankService;

    @PostMapping
    public ResponseEntity<QuestionBankEntity> createQuestion(
            @RequestBody QuestionBankEntity question,
            @RequestParam Integer userId,
            @RequestParam Long storyId) {
        QuestionBankEntity createdQuestion = questionBankService.createQuestion(question, userId, storyId);
        return ResponseEntity.ok(createdQuestion);
    }

    @GetMapping
    public ResponseEntity<List<QuestionBankEntity>> getAllQuestions() {
        List<QuestionBankEntity> questions = questionBankService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<QuestionBankEntity> getQuestionById(@PathVariable Long questionId) {
        QuestionBankEntity question = questionBankService.getQuestionById(questionId);
        return ResponseEntity.ok(question);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<QuestionBankEntity>> getQuestionsByTeacher(@PathVariable Integer teacherId) {
        List<QuestionBankEntity> questions = questionBankService.getQuestionsByTeacher(teacherId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<QuestionBankEntity>> getQuestionsByStory(@PathVariable Long storyId) {
        List<QuestionBankEntity> questions = questionBankService.getQuestionsByStory(storyId);
        return ResponseEntity.ok(questions);
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<QuestionBankEntity> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody QuestionBankEntity updatedQuestion) {
        QuestionBankEntity question = questionBankService.updateQuestion(questionId, updatedQuestion);
        return ResponseEntity.ok(question);
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        questionBankService.deleteQuestion(questionId);
        return ResponseEntity.ok().build();
    }
} 