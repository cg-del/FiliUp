package edu.cit.filiup.dto;

import java.util.List;
import java.util.UUID;

public class QuizSubmissionDTO {
    private UUID quizId;
    private List<QuestionAnswerDTO> answers;
    private Integer timeTakenMinutes;

    // Nested DTO for question answers
    public static class QuestionAnswerDTO {
        private UUID questionId;
        private String selectedAnswer;

        // Getters and Setters
        public UUID getQuestionId() {
            return questionId;
        }

        public void setQuestionId(UUID questionId) {
            this.questionId = questionId;
        }

        public String getSelectedAnswer() {
            return selectedAnswer;
        }

        public void setSelectedAnswer(String selectedAnswer) {
            this.selectedAnswer = selectedAnswer;
        }
    }

    // Getters and Setters for main class
    public UUID getQuizId() {
        return quizId;
    }

    public void setQuizId(UUID quizId) {
        this.quizId = quizId;
    }

    public List<QuestionAnswerDTO> getAnswers() {
        return answers;
    }

    public void setAnswers(List<QuestionAnswerDTO> answers) {
        this.answers = answers;
    }

    public Integer getTimeTakenMinutes() {
        return timeTakenMinutes;
    }

    public void setTimeTakenMinutes(Integer timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
    }
} 