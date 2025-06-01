package edu.cit.filiup.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollments")
@Data
public class EnrollmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "class_code", nullable = false)
    private String classCode;
    
    @Column(name = "is_accepted", columnDefinition = "boolean default false")
    private Boolean isAccepted;

    @Column(name = "enrollment_date")
    private LocalDateTime enrollmentDate;
}