package com.filiup.Filiup.repository;

import com.filiup.Filiup.entity.Section;
import com.filiup.Filiup.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionRepository extends JpaRepository<Section, UUID> {
    List<Section> findByTeacher(User teacher);
    List<Section> findByTeacherId(UUID teacherId);
    Optional<Section> findByInviteCode(String inviteCode);
    boolean existsByInviteCode(String inviteCode);
}
