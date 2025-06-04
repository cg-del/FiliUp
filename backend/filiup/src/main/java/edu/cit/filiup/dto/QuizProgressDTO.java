package edu.cit.filiup.dto;

import java.util.List;
import java.util.UUID;

public class QuizProgressDTO {
    private UUID attemptId;
    private List<QuestionAnswerDTO> currentAnswers;
    private Integer currentQuestionIndex;

    // Nested DTO for current answers
    public static class QuestionAnswerDTO {
        private String questionId;
        private String selectedAnswer;

        // Constructors
        public QuestionAnswerDTO() {}

        public QuestionAnswerDTO(String questionId, String selectedAnswer) {
            this.questionId = questionId;
            this.selectedAnswer = selectedAnswer;
        }

        // Getters and Setters
        public String getQuestionId() {
            return questionId;
        }

        public void setQuestionId(String questionId) {
            this.questionId = questionId;
        }

        public String getSelectedAnswer() {
            return selectedAnswer;
        }

        public void setSelectedAnswer(String selectedAnswer) {
            this.selectedAnswer = selectedAnswer;
        }
    }

    // Constructors
    public QuizProgressDTO() {}

    public QuizProgressDTO(UUID attemptId, List<QuestionAnswerDTO> currentAnswers, Integer currentQuestionIndex) {
        this.attemptId = attemptId;
        this.currentAnswers = currentAnswers;
        this.currentQuestionIndex = currentQuestionIndex;
    }

    // Getters and Setters
    public UUID getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(UUID attemptId) {
        this.attemptId = attemptId;
    }

    public List<QuestionAnswerDTO> getCurrentAnswers() {
        return currentAnswers;
    }

    public void setCurrentAnswers(List<QuestionAnswerDTO> currentAnswers) {
        this.currentAnswers = currentAnswers;
    }

    public Integer getCurrentQuestionIndex() {
        return currentQuestionIndex;
    }

    public void setCurrentQuestionIndex(Integer currentQuestionIndex) {
        this.currentQuestionIndex = currentQuestionIndex;
    }
} 