package com.filiup.Filiup.controller;

import com.filiup.Filiup.dto.user.CreateUserRequest;
import com.filiup.Filiup.dto.user.UserResponse;
import com.filiup.Filiup.entity.UserRole;
import com.filiup.Filiup.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "created_at,desc") String sort) {
        
        try {
            String[] sortParams = sort.split(",");
            if (sortParams.length != 2) {
                throw new IllegalArgumentException("Invalid sort parameter format. Expected 'field,direction'");
            }
            
            String sortField = sortParams[0];
            String sortDirection = sortParams[1];
            
            // Map frontend field names to entity field names if needed
            if ("created_at".equals(sortField)) {
                sortField = "createdAt";
            }
            
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
                
            Sort sortObj = Sort.by(direction, sortField);
            Pageable pageable = PageRequest.of(page, size, sortObj);
            
            System.out.println("Sorting users by: " + sortField + " " + direction);
            if (search != null && !search.trim().isEmpty()) {
                System.out.println("Searching for: " + search.trim());
                return ResponseEntity.ok(adminService.searchUsers(search.trim(), pageable, role));
            }
            return ResponseEntity.ok(adminService.getAllUsers(pageable, role));
            
        } catch (Exception e) {
            System.err.println("Error processing sort parameter: " + sort);
            e.printStackTrace();
            // Fallback to default sorting
            Pageable defaultPageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            return ResponseEntity.ok(adminService.getAllUsers(defaultPageable, role));
        }
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Ensure a default password when none is provided by the client
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            request.setPassword("password");
        }
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody CreateUserRequest request) {
        
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
    }
}
