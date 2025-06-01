package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class QuizAttemptDTO {
    private UUID attemptId;
    private UUID quizId;
    private String quizTitle;
    private UUID studentId;
    private String studentName;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Double score;
    private Integer maxPossibleScore;
    private List<QuestionResponseDTO> responses;
    private Integer timeTakenMinutes;
    private Boolean isCompleted;

    // Nested DTO for quiz question responses
    public static class QuestionResponseDTO {
        private UUID questionId;
        private String questionText;
        private String selectedAnswer;
        private Boolean isCorrect;
        private Integer pointsEarned;
        private Integer possiblePoints;

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
    }

    // Getters and Setters for main class
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

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Integer getMaxPossibleScore() {
        return maxPossibleScore;
    }

    public void setMaxPossibleScore(Integer maxPossibleScore) {
        this.maxPossibleScore = maxPossibleScore;
    }

    public List<QuestionResponseDTO> getResponses() {
        return responses;
    }

    public void setResponses(List<QuestionResponseDTO> responses) {
        this.responses = responses;
    }

    public Integer getTimeTakenMinutes() {
        return timeTakenMinutes;
    }

    public void setTimeTakenMinutes(Integer timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
} 