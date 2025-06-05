package edu.cit.filiup.controller;

import edu.cit.filiup.dto.QuizAttemptDTO;
import edu.cit.filiup.dto.QuizDTO;
import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;
import edu.cit.filiup.dto.QuizEligibilityDTO;
import edu.cit.filiup.dto.QuizProgressDTO;
import edu.cit.filiup.dto.QuizLogDTO;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.QuizService;
import edu.cit.filiup.util.RequireRole;
import jakarta.persistence.EntityNotFoundException;
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

    @PostMapping
    @RequireRole({"TEACHER", "ADMIN"})
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<QuizDTO> createQuiz(
            @RequestBody QuizDTO quizDTO,
            JwtAuthenticationToken jwtAuthToken) {
        
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        System.out.println("=== DEBUG: QuizController.createQuiz ===");
        System.out.println("Received userIdentifier from JWT: '" + userIdentifier + "'");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        System.out.println("Found user by email: " + (user != null ? user.getUserName() + " (ID: " + user.getUserId() + ")" : "null"));
        
        // If not found by email, try by username (in case JWT 'sub' contains username)
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
            System.out.println("Found user by username: " + (user != null ? user.getUserName() + " (ID: " + user.getUserId() + ", Email: " + user.getUserEmail() + ")" : "null"));
        }
        
        if (user == null) {
            System.err.println("ERROR: No user found with email or username: '" + userIdentifier + "'");
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        // Set the creator ID from the authenticated user
        quizDTO.setCreatedById(user.getUserId());
        
        // Extract storyId from the quizDTO
        UUID storyId = quizDTO.getStoryId();
        if (storyId == null) {
            System.err.println("ERROR: storyId is null in request body");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        System.out.println("Creating quiz for story ID: " + storyId);
        QuizDTO createdQuiz = quizService.createQuiz(storyId, quizDTO);
        System.out.println("Quiz created successfully with ID: " + (createdQuiz != null ? createdQuiz.getQuizId() : "null"));
        
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable UUID quizId) {
        QuizDTO quiz = quizService.getQuizById(quizId);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/{quizId}/details")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<QuizDTO> getQuizDetailsWithCorrectAnswers(@PathVariable UUID quizId) {
        QuizDTO quiz = quizService.getQuizWithCorrectAnswers(quizId);
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/story/{storyId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizDTO>> getQuizzesByStoryId(
            @PathVariable UUID storyId,
            JwtAuthenticationToken jwtAuthToken) {
        
        // Extract user role from token
        String userRole = jwtAuthToken.getToken().getClaim("role");
        boolean isStudent = "STUDENT".equals(userRole);
        
        List<QuizDTO> quizzes = quizService.getQuizzesByStoryId(storyId);
        
        // Hide correct answers from students for security
        if (isStudent && quizzes != null) {
            quizzes.forEach(quiz -> {
                if (quiz.getQuestions() != null) {
                    quiz.getQuestions().forEach(question -> {
                        question.setCorrectAnswer(null);
                    });
                }
            });
        }
        
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/created-by")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizDTO>> getQuizzesByCreatedBy(JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<QuizDTO> quizzes = quizService.getQuizzesByCreatedBy(user.getUserId());
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
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizAttemptDTO attempt = quizService.startQuizAttempt(quizId, user.getUserId());
        return new ResponseEntity<>(attempt, HttpStatus.CREATED);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizSubmissionResultDTO> submitQuizAttempt(
            @PathVariable UUID attemptId,
            @RequestBody QuizSubmissionDTO submission) {
        try {
            QuizSubmissionResultDTO result = quizService.submitAndScoreQuizAttempt(attemptId, submission);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/attempts/student")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<List<QuizAttemptDTO>> getMyQuizAttempts(JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
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
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
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

    @PostMapping("/attempts/{attemptId}/auto-submit")
    public ResponseEntity<QuizSubmissionResultDTO> autoSubmitExpiredQuiz(@PathVariable UUID attemptId) {
        try {
            QuizSubmissionResultDTO result = quizService.autoSubmitExpiredQuiz(attemptId);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // New endpoints for resume functionality
    
    @GetMapping("/eligibility/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizEligibilityDTO> checkQuizEligibility(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizEligibilityDTO eligibility = quizService.checkQuizEligibility(quizId, user.getUserId());
        return ResponseEntity.ok(eligibility);
    }

    @PostMapping("/attempts/get-or-create/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> getOrCreateQuizAttempt(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizAttemptDTO attempt = quizService.getOrCreateQuizAttempt(quizId, user.getUserId());
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/attempts/save-progress/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<Void> saveQuizProgress(
            @PathVariable UUID attemptId,
            @RequestBody QuizProgressDTO progressData,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        quizService.saveQuizProgress(attemptId, progressData, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/attempts/with-progress/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> getQuizAttemptWithProgress(
            @PathVariable UUID attemptId,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizAttemptDTO attempt = quizService.getQuizAttemptWithProgress(attemptId, user.getUserId());
        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/attempts/resume/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> resumeQuizAttempt(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            QuizAttemptDTO attempt = quizService.resumeQuizAttempt(quizId, user.getUserId());
            return ResponseEntity.ok(attempt);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Quiz logging endpoints
    
    @PostMapping("/attempts/log/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<Void> logSuspiciousAction(
            @PathVariable UUID attemptId,
            @RequestBody QuizLogDTO.LogEntryDTO logEntry,
            JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        try {
            quizService.logSuspiciousAction(attemptId, logEntry, user.getUserId());
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/attempts/logs/{attemptId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<QuizLogDTO> getQuizLogs(@PathVariable UUID attemptId) {
        try {
            QuizLogDTO logs = quizService.getQuizLogs(attemptId);
            return ResponseEntity.ok(logs);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // New endpoints for teacher quiz attempts
    
    @GetMapping("/attempts/teacher")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsByTeacher(JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<QuizAttemptDTO> attempts = quizService.getQuizAttemptsByTeacher(user.getUserId());
        return ResponseEntity.ok(attempts);
    }
    
    @GetMapping("/attempts/class/{classId}")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsByClass(@PathVariable UUID classId) {
        List<QuizAttemptDTO> attempts = quizService.getQuizAttemptsByClass(classId);
        return ResponseEntity.ok(attempts);
    }
    
    @GetMapping("/class-record-matrix")
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<edu.cit.filiup.dto.ClassRecordDTO> getClassRecordMatrix(JwtAuthenticationToken jwtAuthToken) {
        // Extract user email/username from token
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        // Find user in database - try email first, then username
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        edu.cit.filiup.dto.ClassRecordDTO classRecord = quizService.getClassRecordMatrix(user.getUserId());
        return ResponseEntity.ok(classRecord);
    }
}
