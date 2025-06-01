package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.UUID;

@Entity
@Table(name = "common_stories")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommonStoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID storyId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "cover_picture", columnDefinition = "LONGBLOB")
    @Lob
    private byte[] coverPicture;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "genre", length = 100)
    private String genre;

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

    @Override
    public String toString() {
        return "CommonStoryEntity{" +
                "storyId=" + storyId +
                ", title='" + title + '\'' +
                ", content='" + content + '\'' +
                ", genre='" + genre + '\'' +
                '}';
    }
} 