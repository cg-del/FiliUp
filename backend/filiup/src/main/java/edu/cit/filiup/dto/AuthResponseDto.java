package edu.cit.filiup.dto;

/**
 * Data Transfer Object for authentication responses
 */
public class AuthResponseDto {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private String userRole;

    // Default constructor
    public AuthResponseDto() {
    }

    // Constructor with tokens
    public AuthResponseDto(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    // Constructor with tokens and role
    public AuthResponseDto(String accessToken, String refreshToken, String userRole) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userRole = userRole;
    }

    // Getters and setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
} f