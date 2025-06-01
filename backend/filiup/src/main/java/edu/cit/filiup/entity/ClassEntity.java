package edu.cit.filiup.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import java.security.SecureRandom;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("classId")
    private UUID classId;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "class_code", nullable = false, unique = true, length = 12)
    private String classCode;

    // Teacher relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnore
    private UserEntity teacher;

    // Students relationship
    @ManyToMany
    @JsonIgnore
    @JoinTable(
        name = "class_students",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<UserEntity> students = new ArrayList<>();

    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<StoryEntity> stories = new ArrayList<>();

    // Constructors
    public ClassEntity() {
        this.createdAt = LocalDateTime.now();
        this.classCode = generateClassCode();
    }

    public ClassEntity(String className, UserEntity teacher) {
        this();
        this.className = className;
        this.teacher = teacher;
    }

    // Getters and Setters
    public UUID getClassId() {
        return classId;
    }

    public void setClassId(UUID classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public UserEntity getTeacher() {
        return teacher;
    }

    public void setTeacher(UserEntity teacher) {
        this.teacher = teacher;
    }

    public List<UserEntity> getStudents() {
        return students;
    }

    public void setStudents(List<UserEntity> students) {
        this.students = students;
    }

    public void addStudent(UserEntity student) {
        if (!students.contains(student)) {
            students.add(student);
        }
    }

    public void removeStudent(UserEntity student) {
        students.remove(student);
    }

    public List<StoryEntity> getStories() {
        return stories;
    }

    public void setStories(List<StoryEntity> stories) {
        this.stories = stories;
    }

    public void addStory(StoryEntity story) {
        stories.add(story);
        story.setClassEntity(this);
    }

    public void removeStory(StoryEntity story) {
        stories.remove(story);
        story.setClassEntity(null);
    }

    public String getClassCode() {
        return classCode;
    }

    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }

    private static String generateClassCode() {
        // Generates a random 8-character alphanumeric code
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public String toString() {
        return "ClassEntity{" +
                "classId=" + classId +
                ", className='" + className + '\'' +
                '}';
    }
}
