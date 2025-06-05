package edu.cit.filiup.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for token operations (refresh, verify)
 */
public class TokenDto {
    
    @NotBlank(message = "Token cannot be blank")
    private String token;

    // Default constructor
    public TokenDto() {
    }

    // Constructor with token
    public TokenDto(String token) {
        this.token = token;
    }

    // Getters and setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
} 