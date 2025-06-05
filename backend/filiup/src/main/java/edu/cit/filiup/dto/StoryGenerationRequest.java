package edu.cit.filiup.dto;

public class StoryGenerationRequest {
    private String prompt;
    private Long classId;
    private String title;
    private String genre;
    private String fictionType;

    // Getters and setters
    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getFictionType() {
        return fictionType;
    }

    public void setFictionType(String fictionType) {
        this.fictionType = fictionType;
    }

    @Override
    public String toString() {
        return "StoryGenerationRequest{" +
                "prompt='" + prompt + '\'' +
                ", classId=" + classId +
                ", title='" + title + '\'' +
                ", genre='" + genre + '\'' +
                ", fictionType='" + fictionType + '\'' +
                '}';
    }
} 