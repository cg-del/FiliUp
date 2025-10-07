package com.filiup.Filiup.service;

import com.filiup.Filiup.dto.PhaseResponse;
import com.filiup.Filiup.entity.Phase;
import com.filiup.Filiup.repository.PhaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PhaseService {

    private final PhaseRepository phaseRepository;

    public List<Phase> getAllPhases() {
        return phaseRepository.findAllByOrderByOrderIndexAsc();
    }

    public List<PhaseResponse> getAllPhaseResponses() {
        return getAllPhases().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Phase getPhaseById(UUID id) {
        return phaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + id));
    }

    public PhaseResponse getPhaseResponseById(UUID id) {
        return toResponse(getPhaseById(id));
    }

    public Phase createPhase(Phase phase) {
        // Ensure order index is set correctly
        if (phase.getOrderIndex() == null) {
            Integer maxOrder = phaseRepository.findMaxOrderIndex();
            phase.setOrderIndex(maxOrder != null ? maxOrder + 1 : 1);
        } else {
            // Shift existing phases if necessary
            shiftPhasesForward(phase.getOrderIndex());
        }
        
        log.info("Creating new phase: {}", phase.getTitle());
        return phaseRepository.save(phase);
    }

    public PhaseResponse createPhaseResponse(Phase phase) {
        return toResponse(createPhase(phase));
    }

    public Phase updatePhase(UUID id, Phase phaseDetails) {
        Phase existingPhase = getPhaseById(id);
        
        // Check if order index changed
        if (!existingPhase.getOrderIndex().equals(phaseDetails.getOrderIndex())) {
            reorderPhase(id, phaseDetails.getOrderIndex());
        }
        
        existingPhase.setTitle(phaseDetails.getTitle());
        existingPhase.setDescription(phaseDetails.getDescription());
        existingPhase.setOrderIndex(phaseDetails.getOrderIndex());
        
        log.info("Updating phase: {}", existingPhase.getTitle());
        return phaseRepository.save(existingPhase);
    }

    public PhaseResponse updatePhaseResponse(UUID id, Phase phaseDetails) {
        return toResponse(updatePhase(id, phaseDetails));
    }

    public void deletePhase(UUID id) {
        Phase phase = getPhaseById(id);
        Integer orderIndex = phase.getOrderIndex();
        
        phaseRepository.delete(phase);
        
        // Shift remaining phases backward
        shiftPhasesBackward(orderIndex);
        
        log.info("Deleted phase: {}", phase.getTitle());
    }

    public int getLessonsCount(UUID phaseId) {
        Phase phase = getPhaseById(phaseId);
        return phase.getLessons().size();
    }

    public void reorderPhase(UUID id, Integer newOrderIndex) {
        Phase phase = getPhaseById(id);
        Integer oldOrderIndex = phase.getOrderIndex();
        
        if (oldOrderIndex.equals(newOrderIndex)) {
            return;
        }
        
        if (newOrderIndex > oldOrderIndex) {
            // Moving down - shift phases up
            phaseRepository.shiftPhasesUp(oldOrderIndex + 1, newOrderIndex);
        } else {
            // Moving up - shift phases down
            phaseRepository.shiftPhasesDown(newOrderIndex, oldOrderIndex - 1);
        }
        
        phase.setOrderIndex(newOrderIndex);
        phaseRepository.save(phase);
        
        log.info("Reordered phase {} from position {} to {}", phase.getTitle(), oldOrderIndex, newOrderIndex);
    }

    private void shiftPhasesForward(Integer fromOrderIndex) {
        List<Phase> phasesToShift = phaseRepository.findByOrderIndexGreaterThanEqualOrderByOrderIndexAsc(fromOrderIndex);
        for (Phase phase : phasesToShift) {
            phase.setOrderIndex(phase.getOrderIndex() + 1);
        }
        phaseRepository.saveAll(phasesToShift);
    }

    private void shiftPhasesBackward(Integer fromOrderIndex) {
        List<Phase> phasesToShift = phaseRepository.findByOrderIndexGreaterThanOrderByOrderIndexAsc(fromOrderIndex);
        for (Phase phase : phasesToShift) {
            phase.setOrderIndex(phase.getOrderIndex() - 1);
        }
        phaseRepository.saveAll(phasesToShift);
    }

    private PhaseResponse toResponse(Phase phase) {
        return PhaseResponse.builder()
                .id(phase.getId())
                .title(phase.getTitle())
                .description(phase.getDescription())
                .orderIndex(phase.getOrderIndex())
                .lessonsCount(phase.getLessons() != null ? phase.getLessons().size() : 0)
                .createdAt(phase.getCreatedAt())
                .build();
    }
}
