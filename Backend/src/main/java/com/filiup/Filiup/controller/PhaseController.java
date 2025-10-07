package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.PhaseResponse;
import com.filiup.Filiup.entity.Phase;
import com.filiup.Filiup.service.PhaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/phases")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PhaseController {

    private final PhaseService phaseService;

    @GetMapping
    public ResponseEntity<List<PhaseResponse>> getAllPhases() {
        List<PhaseResponse> phases = phaseService.getAllPhaseResponses();
        return ResponseEntity.ok(phases);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhaseResponse> getPhaseById(@PathVariable UUID id) {
        PhaseResponse phase = phaseService.getPhaseResponseById(id);
        return ResponseEntity.ok(phase);
    }

    @PostMapping
    public ResponseEntity<PhaseResponse> createPhase(@RequestBody Phase phase) {
        PhaseResponse createdPhase = phaseService.createPhaseResponse(phase);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPhase);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhaseResponse> updatePhase(@PathVariable UUID id, @RequestBody Phase phase) {
        PhaseResponse updatedPhase = phaseService.updatePhaseResponse(id, phase);
        return ResponseEntity.ok(updatedPhase);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhase(@PathVariable UUID id) {
        phaseService.deletePhase(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/lessons-count")
    public ResponseEntity<Integer> getLessonsCount(@PathVariable UUID id) {
        int count = phaseService.getLessonsCount(id);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<Void> reorderPhase(@PathVariable UUID id, @RequestParam Integer newOrderIndex) {
        phaseService.reorderPhase(id, newOrderIndex);
        return ResponseEntity.ok().build();
    }
}
