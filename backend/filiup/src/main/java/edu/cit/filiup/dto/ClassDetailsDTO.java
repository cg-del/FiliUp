package edu.cit.filiup.dto;

import edu.cit.filiup.entity.ClassEntity;
import edu.cit.filiup.entity.StoryEntity;
import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.entity.QuestionBankEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ClassDetailsDTO {
    private UUID classId;
    private String className;
    private String description;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String classCode;
    private List<UserDTO> students;
    private List<StoryDTO> stories;

    // Static DTOs for nested objects
    public static class UserDTO {
        private UUID userId;
        private String userName;
        private String userEmail;
        private String userRole;

        // Getters and Setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public String getUserRole() { return userRole; }
        public void setUserRole(String userRole) { this.userRole = userRole; }

        public static UserDTO fromEntity(UserEntity user) {
            UserDTO dto = new UserDTO();
            dto.setUserId(user.getUserId());
            dto.setUserName(user.getUserName());
            dto.setUserEmail(user.getUserEmail());
            dto.setUserRole(user.getUserRole());
            return dto;
        }
    }

    public static class StoryDTO {
        private UUID storyId;
        private String title;
        private String content;
        private String genre;
        private String fictionType;
        private String coverPictureType;
        private String coverPictureUrl;
        private List<QuestionDTO> questions;

        // Getters and Setters
        public UUID getStoryId() { return storyId; }
        public void setStoryId(UUID storyId) { this.storyId = storyId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getGenre() { return genre; }
        public void setGenre(String genre) { this.genre = genre; }
        public String getFictionType() { return fictionType; }
        public void setFictionType(String fictionType) { this.fictionType = fictionType; }
        public String getCoverPictureType() { return coverPictureType; }
        public void setCoverPictureType(String coverPictureType) { this.coverPictureType = coverPictureType; }
        public String getCoverPictureUrl() { return coverPictureUrl; }
        public void setCoverPictureUrl(String coverPictureUrl) { this.coverPictureUrl = coverPictureUrl; }
        public List<QuestionDTO> getQuestions() { return questions; }
        public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }

        public static StoryDTO fromEntity(StoryEntity story) {
            StoryDTO dto = new StoryDTO();
            dto.setStoryId(story.getStoryId());
            dto.setTitle(story.getTitle());
            dto.setContent(story.getContent()); 
            dto.setGenre(story.getGenre());
            dto.setFictionType(story.getFictionType());
            dto.setCoverPictureType(story.getCoverPictureType());
            dto.setCoverPictureUrl(story.getCoverPictureUrl());
            return dto;
        }
    }

    public static class QuestionDTO {
        private UUID questionId;
        private String title;
        private String questionText;
        private String options;
        private LocalDateTime createdAt;

        // Getters and Setters
        public UUID getQuestionId() { return questionId; }
        public void setQuestionId(UUID questionId) { this.questionId = questionId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getQuestionText() { return questionText; }
        public void setQuestionText(String questionText) { this.questionText = questionText; }
        public String getOptions() { return options; }
        public void setOptions(String options) { this.options = options; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public static QuestionDTO fromEntity(QuestionBankEntity question) {
            QuestionDTO dto = new QuestionDTO();
            dto.setQuestionId(question.getQuestionId());
            dto.setTitle(question.getTitle());
            dto.setQuestionText(question.getQuestionText());
            dto.setOptions(question.getOptions());
            dto.setCreatedAt(question.getCreatedAt());
            return dto;
        }
    }

    // Getters and Setters for main class
    public UUID getClassId() { return classId; }
    public void setClassId(UUID classId) { this.classId = classId; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }
    public List<UserDTO> getStudents() { return students; }
    public void setStudents(List<UserDTO> students) { this.students = students; }
    public List<StoryDTO> getStories() { return stories; }
    public void setStories(List<StoryDTO> stories) { this.stories = stories; }

    public static ClassDetailsDTO fromEntity(ClassEntity classEntity) {
        ClassDetailsDTO dto = new ClassDetailsDTO();
        dto.setClassId(classEntity.getClassId());
        dto.setClassName(classEntity.getClassName());
        dto.setDescription(classEntity.getDescription());
        dto.setCreatedAt(classEntity.getCreatedAt());
        dto.setIsActive(classEntity.getIsActive());
        dto.setClassCode(classEntity.getClassCode());
        return dto;
    }
} 