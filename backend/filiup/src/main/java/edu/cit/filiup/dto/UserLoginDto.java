package edu.cit.filiup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object for user login
 */
public class UserLoginDto {
    
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String userEmail;
    
    @NotBlank(message = "Password cannot be blank")
    private String userPassword;

    // Default constructor
    public UserLoginDto() {
    }

    // Constructor with all fields
    public UserLoginDto(String userEmail, String userPassword) {
        this.userEmail = userEmail;
        this.userPassword = userPassword;
    }

    // Getters and setters
    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }
} 