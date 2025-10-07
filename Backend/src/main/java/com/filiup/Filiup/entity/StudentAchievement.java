package com.filiup.Filiup.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_achievements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false, name = "achievement_type", length = 100)
    private String achievementType;

    @Column(nullable = false, name = "achievement_name", length = 255)
    private String achievementName;

    @CreationTimestamp
    @Column(name = "earned_at", updatable = false)
    private LocalDateTime earnedAt;
}
