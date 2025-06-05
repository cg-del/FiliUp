package edu.cit.filiup.dto;

import java.util.List;
import java.util.UUID;

public class ClassAverageSummaryDTO {
    private Double totalAverageScore;
    private Integer totalAttempts;
    private List<StudentAttemptSummaryDTO> studentAttempts;

    public static class StudentAttemptSummaryDTO {
        private UUID attemptId;
        private String studentName;
        private UUID studentId;
        private Double score;
        private Integer maxScore;
        private Double percentage;
        private Integer timeTakenMinutes;
        private String quizTitle;
        private UUID quizId;

        // Constructors
        public StudentAttemptSummaryDTO() {}

        public StudentAttemptSummaryDTO(UUID attemptId, String studentName, UUID studentId, 
                                      Double score, Integer maxScore, Double percentage, Integer timeTakenMinutes, String quizTitle, UUID quizId) {
            this.attemptId = attemptId;
            this.studentName = studentName;
            this.studentId = studentId;
            this.score = score;
            this.maxScore = maxScore;
            this.percentage = percentage;
            this.timeTakenMinutes = timeTakenMinutes;
            this.quizTitle = quizTitle;
            this.quizId = quizId;
        }

        // Getters and Setters
        public UUID getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(UUID attemptId) {
            this.attemptId = attemptId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public UUID getStudentId() {
            return studentId;
        }

        public void setStudentId(UUID studentId) {
            this.studentId = studentId;
        }

        public Double getScore() {
            return score;
        }

        public void setScore(Double score) {
            this.score = score;
        }

        public Integer getMaxScore() {
            return maxScore;
        }

        public void setMaxScore(Integer maxScore) {
            this.maxScore = maxScore;
        }

        public Double getPercentage() {
            return percentage;
        }

        public void setPercentage(Double percentage) {
            this.percentage = percentage;
        }

        public Integer getTimeTakenMinutes() {
            return timeTakenMinutes;
        }

        public void setTimeTakenMinutes(Integer timeTakenMinutes) {
            this.timeTakenMinutes = timeTakenMinutes;
        }

        public String getQuizTitle() {
            return quizTitle;
        }

        public void setQuizTitle(String quizTitle) {
            this.quizTitle = quizTitle;
        }

        public UUID getQuizId() {
            return quizId;
        }

        public void setQuizId(UUID quizId) {
            this.quizId = quizId;
        }
    }

    // Constructors
    public ClassAverageSummaryDTO() {}

    public ClassAverageSummaryDTO(Double totalAverageScore, Integer totalAttempts, List<StudentAttemptSummaryDTO> studentAttempts) {
        this.totalAverageScore = totalAverageScore;
        this.totalAttempts = totalAttempts;
        this.studentAttempts = studentAttempts;
    }

    // Getters and Setters
    public Double getTotalAverageScore() {
        return totalAverageScore;
    }

    public void setTotalAverageScore(Double totalAverageScore) {
        this.totalAverageScore = totalAverageScore;
    }

    public Integer getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public List<StudentAttemptSummaryDTO> getStudentAttempts() {
        return studentAttempts;
    }

    public void setStudentAttempts(List<StudentAttemptSummaryDTO> studentAttempts) {
        this.studentAttempts = studentAttempts;
    }
} 