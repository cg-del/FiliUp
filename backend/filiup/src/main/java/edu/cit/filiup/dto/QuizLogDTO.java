package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class QuizLogDTO {
    private UUID attemptId;
    private List<LogEntryDTO> logEntries;

    // Nested DTO for individual log entries
    public static class LogEntryDTO {
        private LocalDateTime timestamp;
        private String action;
        private String description;
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
        private Integer questionIndex;

        // Constructors
        public LogEntryDTO() {}

        public LogEntryDTO(LocalDateTime timestamp, String action, String description, String severity, Integer questionIndex) {
            this.timestamp = timestamp;
            this.action = action;
            this.description = description;
            this.severity = severity;
            this.questionIndex = questionIndex;
        }

        // Getters and Setters
        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getSeverity() {
            return severity;
        }

        public void setSeverity(String severity) {
            this.severity = severity;
        }

        public Integer getQuestionIndex() {
            return questionIndex;
        }

        public void setQuestionIndex(Integer questionIndex) {
            this.questionIndex = questionIndex;
        }
    }

    // Constructors
    public QuizLogDTO() {}

    public QuizLogDTO(UUID attemptId, List<LogEntryDTO> logEntries) {
        this.attemptId = attemptId;
        this.logEntries = logEntries;
    }

    // Getters and Setters
    public UUID getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(UUID attemptId) {
        this.attemptId = attemptId;
    }

    public List<LogEntryDTO> getLogEntries() {
        return logEntries;
    }

    public void setLogEntries(List<LogEntryDTO> logEntries) {
        this.logEntries = logEntries;
    }
} 