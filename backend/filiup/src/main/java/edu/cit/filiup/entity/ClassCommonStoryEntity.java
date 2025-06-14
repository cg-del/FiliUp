package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "class_common_stories")
public class ClassCommonStoryEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    @JsonIgnore
    private ClassEntity classEntity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private CommonStoryEntity story;
    
    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by", nullable = false)
    @JsonIgnore
    private UserEntity addedBy;
    
    // Constructors
    public ClassCommonStoryEntity() {
        this.addedAt = LocalDateTime.now();
    }
    
    public ClassCommonStoryEntity(ClassEntity classEntity, CommonStoryEntity story, UserEntity addedBy) {
        this();
        this.classEntity = classEntity;
        this.story = story;
        this.addedBy = addedBy;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public ClassEntity getClassEntity() {
        return classEntity;
    }
    
    public void setClassEntity(ClassEntity classEntity) {
        this.classEntity = classEntity;
    }
    
    public CommonStoryEntity getStory() {
        return story;
    }
    
    public void setStory(CommonStoryEntity story) {
        this.story = story;
    }
    
    public LocalDateTime getAddedAt() {
        return addedAt;
    }
    
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
    
    public UserEntity getAddedBy() {
        return addedBy;
    }
    
    public void setAddedBy(UserEntity addedBy) {
        this.addedBy = addedBy;
    }
    
    @Override
    public String toString() {
        return "ClassCommonStoryEntity{" +
                "id=" + id +
                ", classId=" + (classEntity != null ? classEntity.getClassId() : null) +
                ", storyId=" + (story != null ? story.getStoryId() : null) +
                ", addedAt=" + addedAt +
                '}';
    }
} 