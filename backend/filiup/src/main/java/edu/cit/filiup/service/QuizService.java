package edu.cit.filiup.service;

import edu.cit.filiup.dto.QuizAttemptDTO;
import edu.cit.filiup.dto.QuizDTO;
import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;
import edu.cit.filiup.dto.QuizEligibilityDTO;
import edu.cit.filiup.dto.QuizProgressDTO;
import edu.cit.filiup.dto.QuizLogDTO;
import edu.cit.filiup.dto.ClassAverageSummaryDTO;

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
    
    // Method for getting quiz details with correct answers (admin/teacher only)
    QuizDTO getQuizWithCorrectAnswers(UUID quizId);
    
    // Methods for quiz attempts
    QuizDTO getQuizForStudent(UUID quizId);
    QuizAttemptDTO startQuizAttempt(UUID quizId, UUID studentId);
    QuizAttemptDTO submitQuizAttempt(UUID attemptId, QuizSubmissionDTO submission);
    QuizSubmissionResultDTO submitAndScoreQuizAttempt(UUID attemptId, QuizSubmissionDTO submission);
    List<QuizAttemptDTO> getQuizAttemptsByStudent(UUID studentId);
    List<QuizAttemptDTO> getQuizAttemptsByQuiz(UUID quizId);
    QuizAttemptDTO getQuizAttemptById(UUID attemptId);
    List<QuizAttemptDTO> getQuizAttemptsByStudentAndStory(UUID studentId, UUID storyId);
    
    // Method for handling expired quiz auto-submission
    QuizSubmissionResultDTO autoSubmitExpiredQuiz(UUID attemptId);
    
    // New methods for resume functionality
    QuizEligibilityDTO checkQuizEligibility(UUID quizId, UUID studentId);
    QuizAttemptDTO getOrCreateQuizAttempt(UUID quizId, UUID studentId);
    void saveQuizProgress(UUID attemptId, QuizProgressDTO progressData, UUID studentId);
    QuizAttemptDTO getQuizAttemptWithProgress(UUID attemptId, UUID studentId);
    QuizAttemptDTO resumeQuizAttempt(UUID quizId, UUID studentId);
    
    // New methods for quiz logging
    void logSuspiciousAction(UUID attemptId, QuizLogDTO.LogEntryDTO logEntry, UUID studentId);
    QuizLogDTO getQuizLogs(UUID attemptId);
    
    // New methods for teacher quiz attempts
    List<QuizAttemptDTO> getQuizAttemptsByTeacher(UUID teacherId);
    List<QuizAttemptDTO> getQuizAttemptsByClass(UUID classId);
    
    // New method for class record matrix
    edu.cit.filiup.dto.ClassRecordDTO getClassRecordMatrix(UUID teacherId);
    
    // New method for class average summary
    ClassAverageSummaryDTO getClassAverageSummary(UUID userId, String userRole);
    
    // New method for reports with filtering
    List<QuizAttemptDTO> getQuizAttemptReports(UUID teacherId, String quizTitle, UUID classId, Boolean completedOnly);
} 