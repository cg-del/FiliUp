package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.util.UUID;

@Entity
@Table(name = "common_stories")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommonStoryEntity {
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

    @Column(name = "fiction_type")
    private String fictionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @JsonIgnore
    private UserEntity createdBy;

    // Constructors
    public CommonStoryEntity() {
        this.createdAt = LocalDateTime.now();
    }

    public CommonStoryEntity(String title, String content, String genre) {
        this();
        this.title = title;
        this.content = content;
        this.genre = genre;
    }

    public CommonStoryEntity(String title, String content, String genre, String fictionType) {
        this();
        this.title = title;
        this.content = content;
        this.genre = genre;
        this.fictionType = fictionType;
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

    public UserEntity getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserEntity createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public String toString() {
        return "CommonStoryEntity{" +
                "storyId=" + storyId +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", genre='" + genre + '\'' +
                ", fictionType='" + fictionType + '\'' +
                ", coverPictureUrl='" + coverPictureUrl + '\'' +
                ", createdBy=" + (createdBy != null ? createdBy.getUserId() : "null") +
                '}';
    }
} 