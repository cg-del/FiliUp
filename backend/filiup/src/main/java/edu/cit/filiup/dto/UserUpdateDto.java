package edu.cit.filiup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for updating existing users
 */
public class UserUpdateDto {
    
    @Size(max = 255, message = "Username cannot exceed 255 characters")
    private String userName;
    
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String userPassword;
    
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    private String userEmail;
    
    @Size(max = 20, message = "User role cannot exceed 20 characters")
    private String userRole;
    
    private Boolean isActive;

    // Default constructor
    public UserUpdateDto() {
    }

    // Getters and setters
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
} 