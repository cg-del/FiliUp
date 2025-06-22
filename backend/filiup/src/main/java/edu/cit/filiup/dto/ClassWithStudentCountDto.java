package edu.cit.filiup.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ClassWithStudentCountDto {
    private UUID classId;
    private String className;
    private String description;
    private LocalDateTime createdAt;
    private Boolean isActive;
    private String classCode;
    private int studentCount;

    public ClassWithStudentCountDto(UUID classId, String className, String description, LocalDateTime createdAt, Boolean isActive, String classCode, int studentCount) {
        this.classId = classId;
        this.className = className;
        this.description = description;
        this.createdAt = createdAt;
        this.isActive = isActive;
        this.classCode = classCode;
        this.studentCount = studentCount;
    }

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
    public int getStudentCount() { return studentCount; }
    public void setStudentCount(int studentCount) { this.studentCount = studentCount; }
}
