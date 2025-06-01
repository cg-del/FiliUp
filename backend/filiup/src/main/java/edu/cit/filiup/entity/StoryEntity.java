package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.util.UUID;

@Entity
@Table(name = "stories")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID storyId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "cover_picture", columnDefinition = "LONGBLOB")
    @Lob
    @JsonProperty(access = JsonProperty.Access.READ_WRITE)
    private byte[] coverPicture;
    
    @Column(name = "cover_picture_url", length = 500)
    private String coverPictureUrl;

    @Column(name = "cover_picture_type", length = 50)
    @JsonProperty(access = JsonProperty.Access.READ_WRITE)
    private String coverPictureType;

    @Column(name = "created_at", nullable = false)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "genre", nullable = false)
    private String genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    @JsonProperty("classEntity")
    private ClassEntity classEntity;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnore
    private UserEntity createdBy;

    // Constructors
    public StoryEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public StoryEntity(String title, String content, String genre) {
        this();
        this.title = title;
        this.content = content;
        this.genre = genre;
    }

    // Getters and Setters
    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public byte[] getCoverPicture() {
        return coverPicture;
    }

    public void setCoverPicture(byte[] coverPicture) {
        this.coverPicture = coverPicture;
    }
    
    public String getCoverPictureUrl() {
        return coverPictureUrl;
    }

    public void setCoverPictureUrl(String coverPictureUrl) {
        this.coverPictureUrl = coverPictureUrl;
    }

    public String getCoverPictureType() {
        return coverPictureType;
    }

    public void setCoverPictureType(String coverPictureType) {
        this.coverPictureType = coverPictureType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public UserEntity getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserEntity createdBy) {
        this.createdBy = createdBy;
    }

    public ClassEntity getClassEntity() {
        return classEntity;
    }

    public void setClassEntity(ClassEntity classEntity) {
        this.classEntity = classEntity;
    }

    @Override
    public String toString() {
        return "StoryEntity{" +
                "storyId=" + storyId +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", genre='" + genre + '\'' +
                ", coverPictureUrl='" + coverPictureUrl + '\'' +
                ", classEntity=" + (classEntity != null ? classEntity.getClassId() : "null") +
                ", createdBy=" + (createdBy != null ? createdBy.getUserId() : "null") +
                '}';
    }
}
