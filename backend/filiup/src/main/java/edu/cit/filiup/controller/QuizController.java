package edu.cit.filiup.controller;

import edu.cit.filiup.dto.QuizAttemptDTO;
import edu.cit.filiup.dto.QuizDTO;
import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    @Autowired
    public QuizController(QuizService quizService, UserRepository userRepository) {
        this.quizService = quizService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{storyId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<QuizDTO> createQuiz(
            @PathVariable UUID storyId,
            @RequestBody QuizDTO quizDTO,
            JwtAuthenticationToken jwtAuthToken) {
        
        // Extract user email from token
        String userEmail = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database
        UserEntity user = userRepository.findByUserEmail(userEmail);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        // Set the creator ID from the authenticated user
        quizDTO.setCreatedById(user.getUserId());
        
        QuizDTO createdQuiz = quizService.createQuiz(storyId, quizDTO);
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable UUID quizId) {
        QuizDTO quiz = quizService.getQuizById(quizId);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<QuizDTO>> getQuizzesByStoryId(@PathVariable UUID storyId) {
        List<QuizDTO> quizzes = quizService.getQuizzesByStoryId(storyId);
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/created-by/{userId}")
    public ResponseEntity<List<QuizDTO>> getQuizzesByCreatedBy(@PathVariable UUID userId) {
        List<QuizDTO> quizzes = quizService.getQuizzesByCreatedBy(userId);
        return ResponseEntity.ok(quizzes);
    }

    @PutMapping("/{quizId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<QuizDTO> updateQuiz(
            @PathVariable UUID quizId,
            @RequestBody QuizDTO quizDTO) {
        QuizDTO updatedQuiz = quizService.updateQuiz(quizId, quizDTO);
        return ResponseEntity.ok(updatedQuiz);
    }

    @DeleteMapping("/{quizId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable UUID quizId) {
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAllActiveQuizzes() {
        List<QuizDTO> quizzes = quizService.getAllActiveQuizzes();
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/student/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizDTO> getQuizForStudent(@PathVariable UUID quizId) {
        QuizDTO quiz = quizService.getQuizForStudent(quizId);
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/attempts/start/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> startQuizAttempt(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email from token
        String userEmail = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database
        UserEntity user = userRepository.findByUserEmail(userEmail);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizAttemptDTO attempt = quizService.startQuizAttempt(quizId, user.getUserId());
        return new ResponseEntity<>(attempt, HttpStatus.CREATED);
    }

    @PostMapping("/attempts/submit/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> submitQuizAttempt(
            @PathVariable UUID attemptId,
            @RequestBody QuizSubmissionDTO submission) {
        QuizAttemptDTO result = quizService.submitQuizAttempt(attemptId, submission);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/attempts/student")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<List<QuizAttemptDTO>> getMyQuizAttempts(JwtAuthenticationToken jwtAuthToken) {
        // Extract user email from token
        String userEmail = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database
        UserEntity user = userRepository.findByUserEmail(userEmail);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<QuizAttemptDTO> attempts = quizService.getQuizAttemptsByStudent(user.getUserId());
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/attempts/story/{storyId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<List<QuizAttemptDTO>> getMyQuizAttemptsByStory(
            @PathVariable UUID storyId,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email from token
        String userEmail = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database
        UserEntity user = userRepository.findByUserEmail(userEmail);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<QuizAttemptDTO> attempts = quizService.getQuizAttemptsByStudentAndStory(user.getUserId(), storyId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/attempts/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<QuizAttemptDTO> getQuizAttemptById(@PathVariable UUID attemptId) {
        QuizAttemptDTO attempt = quizService.getQuizAttemptById(attemptId);
        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/{quizId}/attempts")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsByQuiz(@PathVariable UUID quizId) {
        List<QuizAttemptDTO> attempts = quizService.getQuizAttemptsByQuiz(quizId);
        return ResponseEntity.ok(attempts);
    }

    @PostMapping("/attempts/submit-and-score/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizSubmissionResultDTO> submitAndScoreQuizAttempt(
            @PathVariable UUID attemptId,
            @RequestBody QuizSubmissionDTO submission) {
        QuizSubmissionResultDTO result = quizService.submitAndScoreQuizAttempt(attemptId, submission);
        return ResponseEntity.ok(result);
    }
} 