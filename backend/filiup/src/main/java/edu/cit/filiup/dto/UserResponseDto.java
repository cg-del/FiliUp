package edu.cit.filiup.dto;

/**
 * Data Transfer Object for user information responses
 */
public class UserResponseDto {
    
    private int userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private boolean isActive;

    // Default constructor
    public UserResponseDto() {
    }

    // Constructor with all fields
    public UserResponseDto(int userId, String userName, String userEmail, String userRole, boolean isActive) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userRole = userRole;
        this.isActive = isActive;
    }

    // Getters and setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
} 