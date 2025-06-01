package edu.cit.filiup.service;

import edu.cit.filiup.dto.QuizAttemptDTO;
import edu.cit.filiup.dto.QuizDTO;
import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;

import java.util.List;
import java.util.UUID;

public interface QuizService {
    QuizDTO createQuiz(UUID storyId, QuizDTO quizDTO);
    QuizDTO getQuizById(UUID quizId);
    List<QuizDTO> getQuizzesByStoryId(UUID storyId);
    List<QuizDTO> getQuizzesByCreatedBy(UUID userId);
    QuizDTO updateQuiz(UUID quizId, QuizDTO quizDTO);
    void deleteQuiz(UUID quizId);
    List<QuizDTO> getAllActiveQuizzes();
    
    // Methods for quiz attempts
    QuizDTO getQuizForStudent(UUID quizId);
    QuizAttemptDTO startQuizAttempt(UUID quizId, UUID studentId);
    QuizAttemptDTO submitQuizAttempt(UUID attemptId, QuizSubmissionDTO submission);
    QuizSubmissionResultDTO submitAndScoreQuizAttempt(UUID attemptId, QuizSubmissionDTO submission);
    List<QuizAttemptDTO> getQuizAttemptsByStudent(UUID studentId);
    List<QuizAttemptDTO> getQuizAttemptsByQuiz(UUID quizId);
    QuizAttemptDTO getQuizAttemptById(UUID attemptId);
    List<QuizAttemptDTO> getQuizAttemptsByStudentAndStory(UUID studentId, UUID storyId);
} 