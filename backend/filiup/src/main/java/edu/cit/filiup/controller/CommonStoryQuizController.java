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
@RequestMapping("/api/v1/common-story-quizzes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class CommonStoryQuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    @Autowired
    public CommonStoryQuizController(QuizService quizService, UserRepository userRepository) {
        this.quizService = quizService;
        this.userRepository = userRepository;
    }

    // Helper method to get user from JWT token
    private UserEntity getUserFromToken(JwtAuthenticationToken jwtAuthToken) {
        String userIdentifier = jwtAuthToken.getToken().getClaim("sub");
        
        UserEntity user = userRepository.findByUserEmail(userIdentifier);
        if (user == null) {
            user = userRepository.findByUserName(userIdentifier);
        }
        
        return user;
    }

    @PostMapping
    @RequireRole({"TEACHER", "ADMIN"})
    @PreAuthorize("hasAnyAuthority('TEACHER', 'ADMIN')")
    public ResponseEntity<QuizDTO> createCommonStoryQuiz(
            @RequestBody QuizDTO quizDTO,
            JwtAuthenticationToken jwtAuthToken) {
        
        System.out.println("=== DEBUG: CommonStoryQuizController.createCommonStoryQuiz ===");
        
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            System.err.println("ERROR: No user found from JWT token");
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        System.out.println("User found: " + user.getUserName() + " (ID: " + user.getUserId() + ")");
        
        // Set the creator ID from the authenticated user
        quizDTO.setCreatedById(user.getUserId());
        
        // Extract commonStoryId from the quizDTO
        UUID commonStoryId = quizDTO.getCommonStoryId();
        if (commonStoryId == null) {
            System.err.println("ERROR: commonStoryId is null in request body");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        
        System.out.println("Creating quiz for common story ID: " + commonStoryId);
        QuizDTO createdQuiz = quizService.createCommonStoryQuiz(commonStoryId, quizDTO);
        System.out.println("Common story quiz created successfully with ID: " + 
                         (createdQuiz != null ? createdQuiz.getQuizId() : "null"));
        
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
    }

    @GetMapping("/common-story/{commonStoryId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizDTO>> getQuizzesByCommonStoryId(
            @PathVariable UUID commonStoryId,
            JwtAuthenticationToken jwtAuthToken) {
        
        // Extract user role from token
        String userRole = jwtAuthToken.getToken().getClaim("role");
        boolean isStudent = "STUDENT".equals(userRole);
        
        List<QuizDTO> quizzes = quizService.getQuizzesByCommonStoryId(commonStoryId);
        
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
    public ResponseEntity<List<QuizDTO>> getCommonStoryQuizzesByCreatedBy(JwtAuthenticationToken jwtAuthToken) {
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<QuizDTO> quizzes = quizService.getCommonStoryQuizzesByCreatedBy(user.getUserId());
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizDTO>> getCommonStoryQuizzesByClassId(
            @PathVariable UUID classId,
            JwtAuthenticationToken jwtAuthToken) {
        
        // Extract user role from token
        String userRole = jwtAuthToken.getToken().getClaim("role");
        boolean isStudent = "STUDENT".equals(userRole);
        
        List<QuizDTO> quizzes = quizService.getCommonStoryQuizzesByClassId(classId);
        
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

    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT', 'TEACHER', 'ADMIN')")
    public ResponseEntity<List<QuizDTO>> getAllActiveCommonStoryQuizzes(JwtAuthenticationToken jwtAuthToken) {
        // Extract user role from token
        String userRole = jwtAuthToken.getToken().getClaim("role");
        boolean isStudent = "STUDENT".equals(userRole);
        
        List<QuizDTO> quizzes = quizService.getAllActiveCommonStoryQuizzes();
        
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

    // Quiz attempt endpoints (reusing the core quiz functionality)
    
    @PostMapping("/attempts/start/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> startCommonStoryQuizAttempt(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizAttemptDTO attempt = quizService.startQuizAttempt(quizId, user.getUserId());
        return new ResponseEntity<>(attempt, HttpStatus.CREATED);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizSubmissionResultDTO> submitCommonStoryQuizAttempt(
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

    @GetMapping("/attempts/common-story/{commonStoryId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<List<QuizAttemptDTO>> getMyQuizAttemptsByCommonStory(
            @PathVariable UUID commonStoryId,
            JwtAuthenticationToken jwtAuthToken) {
        
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<QuizAttemptDTO> attempts = quizService.getQuizAttemptsByStudentAndCommonStory(user.getUserId(), commonStoryId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/eligibility/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizEligibilityDTO> checkCommonStoryQuizEligibility(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizEligibilityDTO eligibility = quizService.checkQuizEligibility(quizId, user.getUserId());
        return ResponseEntity.ok(eligibility);
    }

    @PostMapping("/attempts/get-or-create/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> getOrCreateCommonStoryQuizAttempt(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        QuizAttemptDTO attempt = quizService.getOrCreateQuizAttempt(quizId, user.getUserId());
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/attempts/save-progress/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<Void> saveCommonStoryQuizProgress(
            @PathVariable UUID attemptId,
            @RequestBody QuizProgressDTO progressData,
            JwtAuthenticationToken jwtAuthToken) {
        
        UserEntity user = getUserFromToken(jwtAuthToken);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        quizService.saveQuizProgress(attemptId, progressData, user.getUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/attempts/resume/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<QuizAttemptDTO> resumeCommonStoryQuizAttempt(
            @PathVariable UUID quizId,
            JwtAuthenticationToken jwtAuthToken) {
        
        UserEntity user = getUserFromToken(jwtAuthToken);
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
        
        UserEntity user = getUserFromToken(jwtAuthToken);
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
    public ResponseEntity<QuizLogDTO> getCommonStoryQuizLogs(@PathVariable UUID attemptId) {
        try {
            QuizLogDTO logs = quizService.getQuizLogs(attemptId);
            return ResponseEntity.ok(logs);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
} 