package edu.cit.filiup.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class QuizSubmissionResultDTO {
    private UUID attemptId;
    private UUID quizId;
    private String quizTitle;
    private Double score;
    private Double scorePercentage;
    private Integer maxPossibleScore;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private List<QuestionResultDTO> questionResults;
    private String feedback;
    private String performanceLevel;
    
    // Nested DTO for question results
    public static class QuestionResultDTO {
        private UUID questionId;
        private String questionText;
        private String selectedAnswer;
        private Boolean isCorrect;
        private Integer pointsEarned;
        private Integer possiblePoints;
        private String explanation;
        
        // Getters and Setters
        public UUID getQuestionId() {
            return questionId;
        }
        
        public void setQuestionId(UUID questionId) {
            this.questionId = questionId;
        }
        
        public String getQuestionText() {
            return questionText;
        }
        
        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }
        
        public String getSelectedAnswer() {
            return selectedAnswer;
        }
        
        public void setSelectedAnswer(String selectedAnswer) {
            this.selectedAnswer = selectedAnswer;
        }
        
        public Boolean getIsCorrect() {
            return isCorrect;
        }
        
        public void setIsCorrect(Boolean isCorrect) {
            this.isCorrect = isCorrect;
        }
        
        public Integer getPointsEarned() {
            return pointsEarned;
        }
        
        public void setPointsEarned(Integer pointsEarned) {
            this.pointsEarned = pointsEarned;
        }
        
        public Integer getPossiblePoints() {
            return possiblePoints;
        }
        
        public void setPossiblePoints(Integer possiblePoints) {
            this.possiblePoints = possiblePoints;
        }
        
        public String getExplanation() {
            return explanation;
        }
        
        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }
    
    // Getters and Setters
    public UUID getAttemptId() {
        return attemptId;
    }
    
    public void setAttemptId(UUID attemptId) {
        this.attemptId = attemptId;
    }
    
    public UUID getQuizId() {
        return quizId;
    }
    
    public void setQuizId(UUID quizId) {
        this.quizId = quizId;
    }
    
    public String getQuizTitle() {
        return quizTitle;
    }
    
    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }
    
    public Double getScore() {
        return score;
    }
    
    public void setScore(Double score) {
        this.score = score;
    }
    
    public Double getScorePercentage() {
        return scorePercentage;
    }
    
    public void setScorePercentage(Double scorePercentage) {
        this.scorePercentage = scorePercentage;
    }
    
    public Integer getMaxPossibleScore() {
        return maxPossibleScore;
    }
    
    public void setMaxPossibleScore(Integer maxPossibleScore) {
        this.maxPossibleScore = maxPossibleScore;
    }
    
    public Integer getCorrectAnswers() {
        return correctAnswers;
    }
    
    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public List<QuestionResultDTO> getQuestionResults() {
        return questionResults;
    }
    
    public void setQuestionResults(List<QuestionResultDTO> questionResults) {
        this.questionResults = questionResults;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
    
    public String getPerformanceLevel() {
        return performanceLevel;
    }
    
    public void setPerformanceLevel(String performanceLevel) {
        this.performanceLevel = performanceLevel;
    }
} 