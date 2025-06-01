package edu.cit.filiup.service;

import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.dto.QuizSubmissionResultDTO;
import edu.cit.filiup.entity.QuizAttemptEntity;
import edu.cit.filiup.entity.QuizEntity;
import edu.cit.filiup.entity.QuizQuestionEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class QuizScoringService {

    /**
     * Calculates the score and provides detailed feedback for a quiz attempt
     * 
     * @param quiz The quiz being attempted
     * @param attempt The attempt entity
     * @param submission The submission with answers
     * @return A result DTO with detailed feedback and scores
     */
    public QuizSubmissionResultDTO calculateScore(QuizEntity quiz, QuizAttemptEntity attempt, QuizSubmissionDTO submission) {
        QuizSubmissionResultDTO result = new QuizSubmissionResultDTO();
        result.setAttemptId(attempt.getAttemptId());
        result.setQuizId(quiz.getQuizId());
        result.setQuizTitle(quiz.getTitle());
        
        Map<UUID, String> studentAnswers = new HashMap<>();
        if (submission.getAnswers() != null) {
            for (QuizSubmissionDTO.QuestionAnswerDTO answer : submission.getAnswers()) {
                studentAnswers.put(answer.getQuestionId(), answer.getSelectedAnswer());
            }
        }
        
        List<QuizSubmissionResultDTO.QuestionResultDTO> questionResults = new ArrayList<>();
        double totalScore = 0;
        int maxPossibleScore = 0;
        int correctAnswersCount = 0;
        int totalQuestions = quiz.getQuestions().size();
        
        for (QuizQuestionEntity question : quiz.getQuestions()) {
            QuizSubmissionResultDTO.QuestionResultDTO resultItem = new QuizSubmissionResultDTO.QuestionResultDTO();
            resultItem.setQuestionId(question.getQuestionId());
            resultItem.setQuestionText(question.getQuestionText());
            resultItem.setPossiblePoints(question.getPoints());
            resultItem.setCorrectAnswer(question.getCorrectAnswer());
            
            String selectedAnswer = studentAnswers.get(question.getQuestionId());
            resultItem.setSelectedAnswer(selectedAnswer);
            
            boolean isCorrect = (selectedAnswer != null && selectedAnswer.equals(question.getCorrectAnswer()));
            resultItem.setIsCorrect(isCorrect);
            
            int pointsEarned = isCorrect ? question.getPoints() : 0;
            resultItem.setPointsEarned(pointsEarned);
            
            if (isCorrect) {
                correctAnswersCount++;
                resultItem.setExplanation("Correct! Good job.");
            } else {
                if (selectedAnswer == null || selectedAnswer.isEmpty()) {
                    resultItem.setExplanation("You did not provide an answer. The correct answer was: " + question.getCorrectAnswer());
                } else {
                    resultItem.setExplanation("Incorrect. The correct answer was: " + question.getCorrectAnswer());
                }
            }
            
            totalScore += pointsEarned;
            maxPossibleScore += question.getPoints();
            
            questionResults.add(resultItem);
        }
        
        result.setQuestionResults(questionResults);
        result.setScore(totalScore);
        result.setMaxPossibleScore(maxPossibleScore);
        result.setCorrectAnswers(correctAnswersCount);
        result.setTotalQuestions(totalQuestions);
        
        // Calculate percentage score
        double scorePercentage = 0;
        if (maxPossibleScore > 0) {
            scorePercentage = (totalScore / maxPossibleScore) * 100;
        }
        result.setScorePercentage(scorePercentage);
        
        // Determine performance level and feedback
        String performanceLevel;
        String feedback;
        
        if (scorePercentage >= 90) {
            performanceLevel = "Excellent";
            feedback = "Outstanding work! You've demonstrated a thorough understanding of the material.";
        } else if (scorePercentage >= 80) {
            performanceLevel = "Very Good";
            feedback = "Great job! You have a solid grasp of the concepts.";
        } else if (scorePercentage >= 70) {
            performanceLevel = "Good";
            feedback = "Good work! You understand most of the material, but there's room for improvement in some areas.";
        } else if (scorePercentage >= 60) {
            performanceLevel = "Satisfactory";
            feedback = "You've passed, but consider reviewing the topics you missed to strengthen your understanding.";
        } else if (scorePercentage >= 50) {
            performanceLevel = "Pass";
            feedback = "You've barely passed. Please review the material and consider retaking the quiz to improve your score.";
        } else {
            performanceLevel = "Needs Improvement";
            feedback = "You need to review the material more carefully. Focus on the topics you missed and try again.";
        }
        
        result.setPerformanceLevel(performanceLevel);
        result.setFeedback(feedback);
        
        return result;
    }
} 