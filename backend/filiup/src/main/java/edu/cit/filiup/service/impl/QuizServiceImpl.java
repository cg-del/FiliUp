package edu.cit.filiup.service.impl;

import edu.cit.filiup.dto.QuizAttemptDTO;
import edu.cit.filiup.dto.QuizDTO;
import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;
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

@Service
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final StudentProfileService studentProfileService;
    private final QuizScoringService quizScoringService;
    private final ObjectMapper objectMapper;

    @Autowired
    public QuizServiceImpl(QuizRepository quizRepository, 
                          QuizAttemptRepository quizAttemptRepository,
                          StoryRepository storyRepository,
                          UserRepository userRepository,
                          StudentProfileService studentProfileService,
                          QuizScoringService quizScoringService,
                          ObjectMapper objectMapper) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.studentProfileService = studentProfileService;
        this.quizScoringService = quizScoringService;
        this.objectMapper = objectMapper;
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
        
        QuizEntity quiz = attempt.getQuiz();
        
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

        // Update questions
        if (quizDTO.getQuestions() != null) {
            List<QuizQuestionEntity> questions = quizDTO.getQuestions().stream()
                    .map(questionDTO -> {
                        QuizQuestionEntity question = new QuizQuestionEntity();
                        question.setQuestionText(questionDTO.getQuestionText());
                        try {
                            question.setOptions(objectMapper.writeValueAsString(questionDTO.getOptions()));
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException("Error converting options to JSON", e);
                        }
                        question.setCorrectAnswer(questionDTO.getCorrectAnswer());
                        question.setPoints(questionDTO.getPoints());
                        question.setQuiz(quiz);
                        return question;
                    })
                    .collect(Collectors.toList());
            quiz.setQuestions(questions);
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
} 