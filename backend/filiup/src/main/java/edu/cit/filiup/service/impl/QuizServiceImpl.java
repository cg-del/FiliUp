package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.QuizAttemptDTO;
import edu.cit.filiup.dto.QuizDTO;
import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;
import edu.cit.filiup.dto.QuizEligibilityDTO;
import edu.cit.filiup.dto.QuizProgressDTO;
import edu.cit.filiup.dto.QuizLogDTO;
import edu.cit.filiup.entity.QuizAttemptEntity;
import edu.cit.filiup.entity.QuizEntity;
import edu.cit.filiup.entity.QuizQuestionEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.QuizAttemptRepository;
import edu.cit.filiup.repository.QuizRepository;
import edu.cit.filiup.repository.StoryRepository;
import edu.cit.filiup.repository.UserRepository;
import edu.cit.filiup.service.QuizScoringService;
import edu.cit.filiup.service.QuizService;
import edu.cit.filiup.service.StudentProfileService;
import edu.cit.filiup.service.QuizTimerService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashSet;
import java.util.Set;
import java.util.Comparator;
import java.util.Optional;

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final StudentProfileService studentProfileService;
    private final QuizScoringService quizScoringService;
    private final ObjectMapper objectMapper;
    private final QuizTimerService quizTimerService;
    private final edu.cit.filiup.repository.EnrollmentRepository enrollmentRepository;

    @Autowired
    public QuizServiceImpl(QuizRepository quizRepository, 
                          QuizAttemptRepository quizAttemptRepository,
                          StoryRepository storyRepository,
                          UserRepository userRepository,
                          StudentProfileService studentProfileService,
                          QuizScoringService quizScoringService,
                          ObjectMapper objectMapper,
                          QuizTimerService quizTimerService,
                          edu.cit.filiup.repository.EnrollmentRepository enrollmentRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.studentProfileService = studentProfileService;
        this.quizScoringService = quizScoringService;
        this.objectMapper = objectMapper;
        this.quizTimerService = quizTimerService;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Override
    @Transactional
    public QuizDTO createQuiz(UUID storyId, QuizDTO quizDTO) {
        // Set the storyId in the DTO if not already set
        if (quizDTO.getStoryId() == null) {
            quizDTO.setStoryId(storyId);
        }
        QuizEntity quiz = new QuizEntity();
        updateQuizFromDTO(quiz, quizDTO);
        QuizEntity savedQuiz = quizRepository.save(quiz);
        return convertToDTO(savedQuiz);
    }

    @Override
    public QuizDTO getQuizById(UUID quizId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        return convertToDTO(quiz);
    }

    @Override
    public List<QuizDTO> getQuizzesByStoryId(UUID storyId) {
        List<QuizEntity> quizzes = quizRepository.findByStoryStoryId(storyId);
        return quizzes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizDTO> getQuizzesByCreatedBy(UUID userId) {
        List<QuizEntity> quizzes = quizRepository.findByCreatedByUserId(userId);
        return quizzes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizDTO updateQuiz(UUID quizId, QuizDTO quizDTO) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        updateQuizFromDTO(quiz, quizDTO);
        QuizEntity updatedQuiz = quizRepository.save(quiz);
        return convertToDTO(updatedQuiz);
    }

    @Override
    @Transactional
    public void deleteQuiz(UUID quizId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        quiz.setIsActive(false);
        quizRepository.save(quiz);
    }

    @Override
    public List<QuizDTO> getAllActiveQuizzes() {
        List<QuizEntity> quizzes = quizRepository.findByIsActiveTrue();
        return quizzes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public QuizDTO getQuizWithCorrectAnswers(UUID quizId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        
        // Return the complete quiz with correct answers (no filtering)
        // This method should only be called by admin/teacher endpoints with proper authorization
        return convertToDTO(quiz);
    }

    @Override
    public QuizDTO getQuizForStudent(UUID quizId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        
        // Verify the quiz is active and available
        if (!quiz.getIsActive()) {
            throw new IllegalStateException("Quiz is not active");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(quiz.getOpensAt())) {
            throw new IllegalStateException("Quiz is not open yet");
        }
        if (now.isAfter(quiz.getClosesAt())) {
            throw new IllegalStateException("Quiz has already closed");
        }
        
        // Return a version with hidden correct answers
        QuizDTO dto = convertToDTO(quiz);
        if (dto.getQuestions() != null) {
            dto.getQuestions().forEach(q -> q.setCorrectAnswer(null));
        }
        return dto;
    }

    @Override
    @Transactional
    public QuizAttemptDTO startQuizAttempt(UUID quizId, UUID studentId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        
        // Verify the quiz is active and available
        if (!quiz.getIsActive()) {
            throw new IllegalStateException("Quiz is not active");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(quiz.getOpensAt())) {
            throw new IllegalStateException("Quiz is not open yet");
        }
        if (now.isAfter(quiz.getClosesAt())) {
            throw new IllegalStateException("Quiz has already closed");
        }
        
        // Create a new attempt
        QuizAttemptEntity attempt = new QuizAttemptEntity();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt.setStartedAt(now);
        // Calculate and set expiration time
        LocalDateTime expiresAt = now.plusMinutes(quiz.getTimeLimitMinutes());
        attempt.setExpiresAt(expiresAt);
        attempt.setIsCompleted(false);
        
        // Calculate max possible score
        int maxScore = 0;
        if (quiz.getQuestions() != null) {
            for (QuizQuestionEntity question : quiz.getQuestions()) {
                maxScore += question.getPoints();
            }
        }
        attempt.setMaxPossibleScore(maxScore);
        
        QuizAttemptEntity savedAttempt = quizAttemptRepository.save(attempt);
        
        // Schedule timeout notification and auto-submission
        quizTimerService.scheduleQuizTimeout(savedAttempt.getAttemptId(), expiresAt, studentId);
        
        return convertToAttemptDTO(savedAttempt);
    }

    @Override
    @Transactional
    public QuizSubmissionResultDTO submitAndScoreQuizAttempt(UUID attemptId, QuizSubmissionDTO submission) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        
        // Check if the attempt is already completed
        if (attempt.getIsCompleted()) {
            throw new IllegalStateException("Quiz attempt is already completed");
        }
        
        // Check if the quiz has expired
        LocalDateTime now = LocalDateTime.now();
        if (attempt.getExpiresAt() != null && now.isAfter(attempt.getExpiresAt())) {
            throw new IllegalStateException("Quiz submission time has expired");
        }
        
        QuizEntity quiz = attempt.getQuiz();
        
        // Cancel the scheduled timeout since quiz is being submitted
        quizTimerService.cancelQuizTimeout(attemptId);
        
        // Calculate score and get detailed results
        QuizSubmissionResultDTO result = quizScoringService.calculateScore(quiz, attempt, submission);
        
        // Update the attempt with results
        attempt.setIsCompleted(true);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setScore(result.getScore());
        attempt.setMaxPossibleScore(result.getMaxPossibleScore());
        attempt.setTimeTakenMinutes(submission.getTimeTakenMinutes());
        
        try {
            // Store the responses as JSON
            attempt.setResponses(objectMapper.writeValueAsString(result.getQuestionResults()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting responses to JSON", e);
        }
        
        quizAttemptRepository.save(attempt);
        
        // Update student profile statistics
        studentProfileService.incrementQuizzesTaken(attempt.getStudent().getUserId(), result.getScorePercentage());
        
        return result;
    }

    @Override
    public List<QuizAttemptDTO> getQuizAttemptsByStudent(UUID studentId) {
        List<QuizAttemptEntity> attempts = quizAttemptRepository.findByStudentUserIdOrderByStartedAtDesc(studentId);
        return attempts.stream()
                .map(this::convertToAttemptDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizAttemptDTO> getQuizAttemptsByQuiz(UUID quizId) {
        List<QuizAttemptEntity> attempts = quizAttemptRepository.findByQuizQuizIdOrderByStartedAtDesc(quizId);
        return attempts.stream()
                .map(this::convertToAttemptDTO)
                .collect(Collectors.toList());
    }

    @Override
    public QuizAttemptDTO getQuizAttemptById(UUID attemptId) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        return convertToAttemptDTO(attempt);
    }

    @Override
    public List<QuizAttemptDTO> getQuizAttemptsByStudentAndStory(UUID studentId, UUID storyId) {
        List<QuizAttemptEntity> attempts = quizAttemptRepository.findByQuizStoryStoryIdAndStudentUserIdOrderByStartedAtDesc(storyId, studentId);
        return attempts.stream()
                .map(this::convertToAttemptDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuizAttemptDTO submitQuizAttempt(UUID attemptId, QuizSubmissionDTO submission) {
        // Call the detailed scoring method but return the simpler DTO
        QuizSubmissionResultDTO result = submitAndScoreQuizAttempt(attemptId, submission);
        
        // Convert back to the simpler DTO for backward compatibility
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
                
        return convertToAttemptDTO(attempt);
    }

    @Override
    @Transactional
    public QuizSubmissionResultDTO autoSubmitExpiredQuiz(UUID attemptId) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        
        // Check if the attempt is already completed
        if (attempt.getIsCompleted()) {
            throw new IllegalStateException("Quiz attempt is already completed");
        }
        
        QuizEntity quiz = attempt.getQuiz();
        
        // Create empty submission for expired quiz (no answers)
        QuizSubmissionDTO expiredSubmission = new QuizSubmissionDTO();
        expiredSubmission.setQuizId(quiz.getQuizId());
        expiredSubmission.setAnswers(java.util.Collections.emptyList());
        expiredSubmission.setTimeTakenMinutes(quiz.getTimeLimitMinutes());
        
        // Calculate score and get detailed results (will be 0 since no answers)
        QuizSubmissionResultDTO result = quizScoringService.calculateScore(quiz, attempt, expiredSubmission);
        
        // Update the attempt with results
        attempt.setIsCompleted(true);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setScore(result.getScore());
        attempt.setMaxPossibleScore(result.getMaxPossibleScore());
        attempt.setTimeTakenMinutes(expiredSubmission.getTimeTakenMinutes());
        
        try {
            // Store the responses as JSON
            attempt.setResponses(objectMapper.writeValueAsString(result.getQuestionResults()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting responses to JSON", e);
        }
        
        quizAttemptRepository.save(attempt);
        
        // Update student profile statistics
        studentProfileService.incrementQuizzesTaken(attempt.getStudent().getUserId(), result.getScorePercentage());
        
        return result;
    }

    private void updateQuizFromDTO(QuizEntity quiz, QuizDTO quizDTO) {
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setCategory(quizDTO.getCategory());
        quiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());
        quiz.setOpensAt(quizDTO.getOpensAt());
        quiz.setClosesAt(quizDTO.getClosesAt());
        
        StoryEntity story = storyRepository.findById(quizDTO.getStoryId())
                .orElseThrow(() -> new EntityNotFoundException("Story not found with id: " + quizDTO.getStoryId()));
        quiz.setStory(story);
        
        UserEntity creator = userRepository.findById(quizDTO.getCreatedById())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + quizDTO.getCreatedById()));
        quiz.setCreatedBy(creator);

        // Update questions - handle existing questions properly to avoid orphan deletion error
        if (quizDTO.getQuestions() != null) {
            // Get existing questions or initialize empty list
            List<QuizQuestionEntity> existingQuestions = quiz.getQuestions();
            if (existingQuestions == null) {
                existingQuestions = new ArrayList<>();
                quiz.setQuestions(existingQuestions);
            }
            
            // Create a map of existing questions by ID for efficient lookup
            Map<UUID, QuizQuestionEntity> existingQuestionsMap = existingQuestions.stream()
                    .filter(q -> q.getQuestionId() != null)
                    .collect(Collectors.toMap(QuizQuestionEntity::getQuestionId, q -> q));
            
            // Clear the list but keep the reference to avoid orphan deletion issues
            existingQuestions.clear();
            
            // Process each question from the DTO
            for (QuizDTO.QuizQuestionDTO questionDTO : quizDTO.getQuestions()) {
                QuizQuestionEntity question;
                
                // Check if this is an existing question (has valid ID and exists in map)
                if (questionDTO.getQuestionId() != null && existingQuestionsMap.containsKey(questionDTO.getQuestionId())) {
                    // Update existing question
                    question = existingQuestionsMap.get(questionDTO.getQuestionId());
                } else {
                    // Create new question
                    question = new QuizQuestionEntity();
                    question.setQuiz(quiz);
                }
                
                // Update question fields
                question.setQuestionText(questionDTO.getQuestionText());
                try {
                    question.setOptions(objectMapper.writeValueAsString(questionDTO.getOptions()));
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Error converting options to JSON", e);
                }
                question.setCorrectAnswer(questionDTO.getCorrectAnswer());
                question.setPoints(questionDTO.getPoints());
                
                // Add to the list
                existingQuestions.add(question);
            }
        }
    }

    private QuizDTO convertToDTO(QuizEntity quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setQuizId(quiz.getQuizId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setCategory(quiz.getCategory());
        dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        dto.setOpensAt(quiz.getOpensAt());
        dto.setClosesAt(quiz.getClosesAt());
        dto.setStoryId(quiz.getStory().getStoryId());
        dto.setStoryTitle(quiz.getStory().getTitle());
        dto.setCreatedById(quiz.getCreatedBy().getUserId());
        dto.setCreatedByName(quiz.getCreatedBy().getUserName());
        dto.setCreatedAt(quiz.getCreatedAt());
        dto.setIsActive(quiz.getIsActive());

        // Convert questions
        if (quiz.getQuestions() != null) {
            List<QuizDTO.QuizQuestionDTO> questionDTOs = quiz.getQuestions().stream()
                    .map(question -> {
                        QuizDTO.QuizQuestionDTO questionDTO = new QuizDTO.QuizQuestionDTO();
                        questionDTO.setQuestionId(question.getQuestionId());
                        questionDTO.setQuestionText(question.getQuestionText());
                        try {
                            List<String> options = objectMapper.readValue(
                                    question.getOptions(),
                                    new TypeReference<List<String>>() {}
                            );
                            questionDTO.setOptions(options);
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException("Error parsing options JSON", e);
                        }
                        questionDTO.setCorrectAnswer(question.getCorrectAnswer());
                        questionDTO.setPoints(question.getPoints());
                        return questionDTO;
                    })
                    .collect(Collectors.toList());
            dto.setQuestions(questionDTOs);
        }

        return dto;
    }

    private QuizAttemptDTO convertToAttemptDTO(QuizAttemptEntity attempt) {
        QuizAttemptDTO dto = new QuizAttemptDTO();
        dto.setAttemptId(attempt.getAttemptId());
        dto.setQuizId(attempt.getQuiz().getQuizId());
        dto.setQuizTitle(attempt.getQuiz().getTitle());
        dto.setStudentId(attempt.getStudent().getUserId());
        dto.setStudentName(attempt.getStudent().getUserName());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setExpiresAt(attempt.getExpiresAt());
        dto.setCompletedAt(attempt.getCompletedAt());
        dto.setScore(attempt.getScore());
        dto.setMaxPossibleScore(attempt.getMaxPossibleScore());
        dto.setTimeTakenMinutes(attempt.getTimeTakenMinutes());
        dto.setIsCompleted(attempt.getIsCompleted());
        
        // Convert responses JSON to DTO objects
        if (attempt.getResponses() != null) {
            try {
                List<QuizAttemptDTO.QuestionResponseDTO> responses = objectMapper.readValue(
                        attempt.getResponses(),
                        new TypeReference<List<QuizAttemptDTO.QuestionResponseDTO>>() {}
                );
                dto.setResponses(responses);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error parsing responses JSON", e);
            }
        }
        
        return dto;
    }

    // New methods for resume functionality
    
    @Override
    public QuizEligibilityDTO checkQuizEligibility(UUID quizId, UUID studentId) {
        QuizEntity quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz not found with id: " + quizId));
        
        UserEntity student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        
        // Check for existing attempts
        List<QuizAttemptEntity> existingAttempts = quizAttemptRepository
                .findByQuizQuizIdAndStudentUserIdOrderByStartedAtDesc(quizId, studentId);
        
        // Check if student has already completed this quiz
        boolean hasCompletedAttempt = existingAttempts.stream()
                .anyMatch(attempt -> attempt.getIsCompleted());
        
        if (hasCompletedAttempt) {
            return new QuizEligibilityDTO(false, "Quiz already completed", null, true, false);
        }
        
        // Check for in-progress attempt
        QuizAttemptEntity inProgressAttempt = existingAttempts.stream()
                .filter(attempt -> !attempt.getIsCompleted())
                .findFirst()
                .orElse(null);
        
        if (inProgressAttempt != null) {
            // Check if the attempt has expired
            LocalDateTime now = LocalDateTime.now();
            if (inProgressAttempt.getExpiresAt() != null && now.isAfter(inProgressAttempt.getExpiresAt())) {
                // Attempt has expired, auto-submit it
                autoSubmitExpiredQuiz(inProgressAttempt.getAttemptId());
                return new QuizEligibilityDTO(false, "Previous attempt expired and was auto-submitted", null, true, false);
            } else {
                // Has valid in-progress attempt
                QuizAttemptDTO existingAttemptDTO = convertToAttemptDTO(inProgressAttempt);
                return new QuizEligibilityDTO(true, "Has in-progress attempt", existingAttemptDTO, false, true);
            }
        }
        
        // Verify the quiz is active and available for new attempts
        if (!quiz.getIsActive()) {
            return new QuizEligibilityDTO(false, "Quiz is not active", null, false, false);
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(quiz.getOpensAt())) {
            return new QuizEligibilityDTO(false, "Quiz is not open yet", null, false, false);
        }
        if (now.isAfter(quiz.getClosesAt())) {
            return new QuizEligibilityDTO(false, "Quiz has already closed", null, false, false);
        }
        
        // Can start new attempt
        return new QuizEligibilityDTO(true, "Can start new attempt", null, false, false);
    }
    
    @Override
    @Transactional
    public QuizAttemptDTO getOrCreateQuizAttempt(UUID quizId, UUID studentId) {
        // First check eligibility
        QuizEligibilityDTO eligibility = checkQuizEligibility(quizId, studentId);
        
        if (eligibility.getHasInProgressAttempt() && eligibility.getExistingAttempt() != null) {
            // Return existing in-progress attempt
            return eligibility.getExistingAttempt();
        }
        
        if (!eligibility.getCanAttempt()) {
            throw new IllegalStateException(eligibility.getReason());
        }
        
        // Create new attempt
        return startQuizAttempt(quizId, studentId);
    }
    
    @Override
    @Transactional
    public void saveQuizProgress(UUID attemptId, QuizProgressDTO progressData, UUID studentId) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        
        // Verify the attempt belongs to the student
        if (!attempt.getStudent().getUserId().equals(studentId)) {
            throw new IllegalArgumentException("Quiz attempt does not belong to the specified student");
        }
        
        // Verify the attempt is not completed
        if (attempt.getIsCompleted()) {
            throw new IllegalStateException("Cannot save progress for completed quiz attempt");
        }
        
        // Verify the attempt has not expired
        LocalDateTime now = LocalDateTime.now();
        if (attempt.getExpiresAt() != null && now.isAfter(attempt.getExpiresAt())) {
            throw new IllegalStateException("Cannot save progress for expired quiz attempt");
        }
        
        // Convert progress data to JSON and save
        try {
            Map<String, String> currentAnswers = new HashMap<>();
            if (progressData.getCurrentAnswers() != null) {
                for (QuizProgressDTO.QuestionAnswerDTO answer : progressData.getCurrentAnswers()) {
                    currentAnswers.put(answer.getQuestionId(), answer.getSelectedAnswer());
                }
            }
            
            // Store current answers and question index
            attempt.setCurrentAnswers(objectMapper.writeValueAsString(currentAnswers));
            attempt.setCurrentQuestionIndex(progressData.getCurrentQuestionIndex());
            
            quizAttemptRepository.save(attempt);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting current answers to JSON", e);
        }
    }
    
    @Override
    public QuizAttemptDTO getQuizAttemptWithProgress(UUID attemptId, UUID studentId) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        
        // Verify the attempt belongs to the student
        if (!attempt.getStudent().getUserId().equals(studentId)) {
            throw new IllegalArgumentException("Quiz attempt does not belong to the specified student");
        }
        
        QuizAttemptDTO dto = convertToAttemptDTO(attempt);
        
        // Add current answers if available
        if (attempt.getCurrentAnswers() != null) {
            try {
                Map<String, String> currentAnswers = objectMapper.readValue(
                        attempt.getCurrentAnswers(),
                        new TypeReference<Map<String, String>>() {}
                );
                dto.setCurrentAnswers(currentAnswers);
            } catch (JsonProcessingException e) {
                // If JSON parsing fails, just continue without current answers
                System.err.println("Error parsing current answers JSON: " + e.getMessage());
            }
        }
        
        dto.setCurrentQuestionIndex(attempt.getCurrentQuestionIndex());
        
        return dto;
    }
    
    @Override
    public QuizAttemptDTO resumeQuizAttempt(UUID quizId, UUID studentId) {
        QuizEligibilityDTO eligibility = checkQuizEligibility(quizId, studentId);
        
        if (!eligibility.getHasInProgressAttempt() || eligibility.getExistingAttempt() == null) {
            throw new EntityNotFoundException("No in-progress quiz attempt found to resume");
        }
        
        return eligibility.getExistingAttempt();
    }
    
    // Quiz logging methods implementation
    
    @Override
    @Transactional
    public void logSuspiciousAction(UUID attemptId, QuizLogDTO.LogEntryDTO logEntry, UUID studentId) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        
        // Verify the attempt belongs to the student
        if (!attempt.getStudent().getUserId().equals(studentId)) {
            throw new IllegalArgumentException("Quiz attempt does not belong to the specified student");
        }
        
        // Verify the attempt is not completed
        if (attempt.getIsCompleted()) {
            throw new IllegalStateException("Cannot log actions for completed quiz attempt");
        }
        
        try {
            // Get existing logs or create new list
            List<QuizLogDTO.LogEntryDTO> existingLogs = new ArrayList<>();
            if (attempt.getLogs() != null && !attempt.getLogs().isEmpty()) {
                existingLogs = objectMapper.readValue(
                    attempt.getLogs(),
                    new TypeReference<List<QuizLogDTO.LogEntryDTO>>() {}
                );
            }
            
            // Add new log entry
            existingLogs.add(logEntry);
            
            // Save back to database
            attempt.setLogs(objectMapper.writeValueAsString(existingLogs));
            quizAttemptRepository.save(attempt);
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing quiz logs JSON", e);
        }
    }
    
    @Override
    public QuizLogDTO getQuizLogs(UUID attemptId) {
        QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new EntityNotFoundException("Quiz attempt not found with id: " + attemptId));
        
        QuizLogDTO logDTO = new QuizLogDTO();
        logDTO.setAttemptId(attemptId);
        
        if (attempt.getLogs() != null && !attempt.getLogs().isEmpty()) {
            try {
                List<QuizLogDTO.LogEntryDTO> logEntries = objectMapper.readValue(
                    attempt.getLogs(),
                    new TypeReference<List<QuizLogDTO.LogEntryDTO>>() {}
                );
                logDTO.setLogEntries(logEntries);
            } catch (JsonProcessingException e) {
                // If JSON parsing fails, return empty logs
                System.err.println("Error parsing quiz logs JSON: " + e.getMessage());
                logDTO.setLogEntries(new ArrayList<>());
            }
        } else {
            logDTO.setLogEntries(new ArrayList<>());
        }
        
        return logDTO;
    }
    
    // New methods for teacher quiz attempts
    
    @Override
    public List<QuizAttemptDTO> getQuizAttemptsByTeacher(UUID teacherId) {
        List<QuizAttemptEntity> attempts = quizAttemptRepository.findQuizAttemptsByTeacher(teacherId);
        return attempts.stream()
                .map(this::convertToAttemptDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<QuizAttemptDTO> getQuizAttemptsByClass(UUID classId) {
        List<QuizAttemptEntity> attempts = quizAttemptRepository.findQuizAttemptsByClass(classId);
        return attempts.stream()
                .map(this::convertToAttemptDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public edu.cit.filiup.dto.ClassRecordDTO getClassRecordMatrix(UUID teacherId) {
        // Get all completed quiz attempts for students in teacher's classes
        List<QuizAttemptEntity> attempts = quizAttemptRepository.findCompletedQuizAttemptsByTeacherClasses(teacherId);
        
        // Filter attempts to only include students who are enrolled and accepted in the specific class
        List<QuizAttemptEntity> filteredAttempts = new ArrayList<>();
        for (QuizAttemptEntity attempt : attempts) {
            String classCode = attempt.getQuiz().getStory().getClassEntity().getClassCode();
            UUID studentId = attempt.getStudent().getUserId();
            
            // Check if student is enrolled and accepted in this specific class
            Optional<edu.cit.filiup.entity.EnrollmentEntity> enrollment = 
                enrollmentRepository.findByUserIdAndClassCode(studentId, classCode);
            
            if (enrollment.isPresent() && Boolean.TRUE.equals(enrollment.get().getIsAccepted())) {
                filteredAttempts.add(attempt);
            }
        }
        
        // Group attempts by student and quiz
        Map<String, Map<String, QuizAttemptEntity>> studentQuizMatrix = new HashMap<>();
        Set<String> allQuizTitles = new HashSet<>();
        Map<String, String> classInfo = new HashMap<>();
        Map<String, edu.cit.filiup.dto.ClassRecordDTO.QuizMetadataDTO> quizMetadata = new HashMap<>();
        
        for (QuizAttemptEntity attempt : filteredAttempts) {
            String studentName = attempt.getStudent().getUserName();
            String quizTitle = attempt.getQuiz().getTitle();
            String storyTitle = attempt.getQuiz().getStory().getTitle();
            String storyId = attempt.getQuiz().getStory().getStoryId().toString();
            String classId = attempt.getQuiz().getStory().getClassEntity().getClassId().toString();
            String className = attempt.getQuiz().getStory().getClassEntity().getClassName();
            
            // Store class info
            classInfo.put(classId, className);
            
            // Store quiz metadata
            if (!quizMetadata.containsKey(quizTitle)) {
                quizMetadata.put(quizTitle, new edu.cit.filiup.dto.ClassRecordDTO.QuizMetadataDTO(
                    quizTitle, storyTitle, storyId, classId, className
                ));
            }
            
            // Group by student
            studentQuizMatrix.computeIfAbsent(studentName, k -> new HashMap<>())
                    .put(quizTitle, attempt);
            
            allQuizTitles.add(quizTitle);
        }
        
        // Convert to DTO format
        List<edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO> studentRecords = new ArrayList<>();
        
        for (Map.Entry<String, Map<String, QuizAttemptEntity>> studentEntry : studentQuizMatrix.entrySet()) {
            String studentName = studentEntry.getKey();
            Map<String, QuizAttemptEntity> studentAttempts = studentEntry.getValue();
            
            edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO studentRecord = 
                    new edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO();
            studentRecord.setStudentName(studentName);
            
            // Get student ID from any attempt
            QuizAttemptEntity anyAttempt = studentAttempts.values().iterator().next();
            studentRecord.setStudentId(anyAttempt.getStudent().getUserId().toString());
            
            // Create quiz scores map
            Map<String, edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO.ScoreDTO> quizScores = new HashMap<>();
            
            for (String quizTitle : allQuizTitles) {
                QuizAttemptEntity attempt = studentAttempts.get(quizTitle);
                if (attempt != null) {
                    String storyTitle = attempt.getQuiz().getStory().getTitle();
                    String storyId = attempt.getQuiz().getStory().getStoryId().toString();
                    String classId = attempt.getQuiz().getStory().getClassEntity().getClassId().toString();
                    String className = attempt.getQuiz().getStory().getClassEntity().getClassName();
                    
                    edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO.ScoreDTO scoreDTO = 
                            new edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO.ScoreDTO(
                                    attempt.getScore(), 
                                    attempt.getMaxPossibleScore(),
                                    storyTitle,
                                    storyId,
                                    classId,
                                    className
                            );
                    quizScores.put(quizTitle, scoreDTO);
                }
                // If no attempt, leave null in the map (will be handled in frontend)
            }
            
            studentRecord.setQuizScores(quizScores);
            studentRecords.add(studentRecord);
        }
        
        // Sort students by name
        studentRecords.sort(Comparator.comparing(edu.cit.filiup.dto.ClassRecordDTO.StudentRecordDTO::getStudentName));
        
        // Sort quiz titles
        List<String> sortedQuizTitles = new ArrayList<>(allQuizTitles);
        sortedQuizTitles.sort(String::compareTo);
        
        // Create final DTO
        edu.cit.filiup.dto.ClassRecordDTO classRecordDTO = new edu.cit.filiup.dto.ClassRecordDTO();
        classRecordDTO.setStudents(studentRecords);
        classRecordDTO.setQuizTitles(sortedQuizTitles);
        classRecordDTO.setClassInfo(classInfo);
        classRecordDTO.setQuizMetadata(quizMetadata);
        
        return classRecordDTO;
    }
} 