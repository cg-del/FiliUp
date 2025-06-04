package edu.cit.filiup.dto;

public class QuizEligibilityDTO {
    private Boolean canAttempt;
    private String reason;
    private QuizAttemptDTO existingAttempt;
    private Boolean hasCompletedAttempt;
    private Boolean hasInProgressAttempt;

    // Constructors
    public QuizEligibilityDTO() {}

    public QuizEligibilityDTO(Boolean canAttempt, String reason, QuizAttemptDTO existingAttempt, 
                             Boolean hasCompletedAttempt, Boolean hasInProgressAttempt) {
        this.canAttempt = canAttempt;
        this.reason = reason;
        this.existingAttempt = existingAttempt;
        this.hasCompletedAttempt = hasCompletedAttempt;
        this.hasInProgressAttempt = hasInProgressAttempt;
    }

    // Getters and Setters
    public Boolean getCanAttempt() {
        return canAttempt;
    }

    public void setCanAttempt(Boolean canAttempt) {
        this.canAttempt = canAttempt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public QuizAttemptDTO getExistingAttempt() {
        return existingAttempt;
    }

    public void setExistingAttempt(QuizAttemptDTO existingAttempt) {
        this.existingAttempt = existingAttempt;
    }

    public Boolean getHasCompletedAttempt() {
        return hasCompletedAttempt;
    }

    public void setHasCompletedAttempt(Boolean hasCompletedAttempt) {
        this.hasCompletedAttempt = hasCompletedAttempt;
    }

    public Boolean getHasInProgressAttempt() {
        return hasInProgressAttempt;
    }

    public void setHasInProgressAttempt(Boolean hasInProgressAttempt) {
        this.hasInProgressAttempt = hasInProgressAttempt;
    }
} 