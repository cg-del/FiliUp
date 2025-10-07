package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.section.CreateSectionRequest;
import com.filiup.Filiup.dto.section.SectionResponse;
import com.filiup.Filiup.entity.Section;
import com.filiup.Filiup.entity.User;
import com.filiup.Filiup.repository.SectionRepository;
import com.filiup.Filiup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final UserRepository userRepository;

    @Transactional
    public SectionResponse createSection(CreateSectionRequest request, UUID teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        String inviteCode = generateUniqueInviteCode();

        Section section = Section.builder()
                .name(request.getName())
                .gradeLevel(request.getGradeLevel())
                .teacher(teacher)
                .inviteCode(inviteCode)
                .capacity(request.getCapacity())
                .isActive(true)
                .build();

        section = sectionRepository.save(section);
        return mapToSectionResponse(section);
    }

    public List<SectionResponse> getTeacherSections(UUID teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        return sectionRepository.findByTeacher(teacher).stream()
                .map(this::mapToSectionResponse)
                .collect(Collectors.toList());
    }

    public SectionResponse getSectionById(UUID sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        return mapToSectionResponse(section);
    }

    private String generateUniqueInviteCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (sectionRepository.existsByInviteCode(code));
        return code;
    }

    private String generateRandomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    private SectionResponse mapToSectionResponse(Section section) {
        long activeStudents = section.getStudents().stream()
                .filter(User::getIsActive)
                .count();

        return SectionResponse.builder()
                .id(section.getId())
                .name(section.getName())
                .gradeLevel(section.getGradeLevel())
                .inviteCode(section.getInviteCode())
                .studentCount(section.getStudents().size())
                .activeStudents((int) activeStudents)
                .averageProgress(0.0) // Calculate based on actual progress
                .build();
    }
}
