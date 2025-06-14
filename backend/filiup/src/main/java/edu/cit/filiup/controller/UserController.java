package edu.cit.filiup.controller;

import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.util.JwtUtil;
import edu.cit.filiup.util.RequireRole;
import edu.cit.filiup.util.ResponseUtil;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class UserController {

    @Autowired
    UserService userv;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/postUser")
    @RequireRole({"ADMIN"})
    public ResponseEntity<?> postUser(@RequestBody UserEntity user) {
        try {
            UserEntity savedUser = userv.postUser(user);
            return ResponseUtil.success("User created successfully", savedUser);
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to create user: " + e.getMessage());
        }
    }
    
    @GetMapping("/getAllUser")
    @RequireRole({"ADMIN"})
    public ResponseEntity<?> getAllUser(){
        try {
            List<UserEntity> users = userv.getAllUser();
            return ResponseUtil.success("Users retrieved successfully", users);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to retrieve users: " + e.getMessage());
        }
    }
    
    @PutMapping("/putUser")
    public ResponseEntity<?> putUser(@RequestParam int id, @RequestBody UserEntity newUserDetails) {
        try {
            UserEntity updatedUser = userv.putUser(id, newUserDetails);
            if (updatedUser != null) {
                return ResponseUtil.success("User updated successfully", updatedUser);
            } else {
                return ResponseUtil.notFound("User with ID " + id + " not found");
            }
        } catch (Exception e) {
            return ResponseUtil.badRequest("Failed to update user: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/deleteUser/{id}")
    @RequireRole({"ADMIN"})
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        try {
            String result = userv.deleteUser(id);
            return ResponseUtil.success(result);
        } catch (Exception e) {
            return ResponseUtil.notFound("User with ID " + id + " not found: " + e.getMessage());
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserEntity user) {
        try {
            // Automatically set user role to STUDENT for signup
            user.setUserRole("STUDENT");
            UserEntity newUser = userv.registerUser(user);
            if (newUser != null) {
                Map<String, String> tokens = JwtUtil.generateTokens(newUser.getUserEmail(), newUser.getUserRole());
                return ResponseUtil.success("Registration successful", tokens);
            }
            return ResponseUtil.badRequest("Registration failed");
        } catch (Exception e) {
            return ResponseUtil.badRequest("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserEntity user) {
        try {
            UserEntity loggedInUser = userv.loginUserByUsername(user.getUserName(), user.getUserPassword());
            if (loggedInUser != null) {
                Map<String, String> tokens = JwtUtil.generateTokens(loggedInUser.getUserName(), loggedInUser.getUserRole());
                return ResponseUtil.success("Login successful", tokens);
            } else {
                return ResponseUtil.unauthorized("Invalid username or password");
            }
        } catch (Exception e) {
            return ResponseUtil.badRequest("Login failed: " + e.getMessage());
        }
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(JwtAuthenticationToken jwtAuthToken) {
        try {
            String email = jwtAuthToken.getToken().getClaim("sub");
            UserEntity user = userv.getUserByEmail(email);
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("userId", user.getUserId());
                response.put("userName", user.getUserName());
                response.put("userRole", user.getUserRole());
                response.put("userEmail", user.getUserEmail());
                return ResponseUtil.success("User info retrieved successfully", response);
            }
            return ResponseUtil.notFound("User not found for email: " + email);
        } catch (Exception e) {
            return ResponseUtil.unauthorized("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            return ResponseUtil.badRequest("No refresh token provided");
        }

        try {
            if (JwtUtil.validateToken(refreshToken) && !JwtUtil.isTokenExpired(refreshToken)) {
                String userEmail = JwtUtil.extractUsername(refreshToken);
                UserEntity user = userv.getUserByEmail(userEmail);
                if (user != null) {
                    Map<String, String> tokens = JwtUtil.generateTokens(user.getUserEmail(), user.getUserRole());
                    return ResponseUtil.success("Token refreshed successfully", tokens);
                }
            }
            return ResponseUtil.unauthorized("Invalid refresh token");
        } catch (Exception e) {
            return ResponseUtil.unauthorized("Token refresh failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null) {
            return ResponseUtil.badRequest("No token provided");
        }

        try {
            // Verify the token
            if (JwtUtil.validateToken(token)) {
                String userEmail = JwtUtil.extractUsername(token);
                UserEntity user = userv.getUserByEmail(userEmail);
                if (user != null) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("valid", true);
                    response.put("userName", user.getUserName());
                    response.put("userRole", user.getUserRole());
                    response.put("userEmail", user.getUserEmail());
                    return ResponseUtil.success("Token verified successfully", response);
                }
            }
            return ResponseUtil.unauthorized("Invalid token");
        } catch (Exception e) {
            return ResponseUtil.unauthorized("Token verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/hello")
    public ResponseEntity<?> hello(JwtAuthenticationToken jwtAuthToken) {
        try {
            String email = jwtAuthToken.getToken().getClaim("sub");
            UserEntity user = userv.getUserByEmail(email);
            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Hello, " + user.getUserName() + "!");
                response.put("userName", user.getUserName());
                response.put("userRole", user.getUserRole());
                response.put("userEmail", user.getUserEmail());
                return ResponseUtil.success("Hello request successful", response);
            }
            return ResponseUtil.notFound("User not found for email: " + email);
        } catch (Exception e) {
            return ResponseUtil.unauthorized("Authentication failed: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> searchStudentsByName(@RequestParam String name) {
        try {
            List<UserEntity> students = userRepository.findByUserRoleAndUserNameContainingIgnoreCase("STUDENT", name);
            return ResponseUtil.success("Students retrieved successfully", students);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to search students: " + e.getMessage());
        }
    }

    @GetMapping("/sorted-by-role")
    @RequireRole({"TEACHER", "ADMIN"})
    public ResponseEntity<?> getUsersSortedByRole() {
        try {
            List<UserEntity> allUsers = userv.getAllUser();
            Map<String, List<UserEntity>> sortedUsers = new HashMap<>();
            
            // Initialize lists for each role
            sortedUsers.put("TEACHERS", new ArrayList<>());
            sortedUsers.put("STUDENTS", new ArrayList<>());
            
            // Sort users into their respective lists
            for (UserEntity user : allUsers) {
                if (user.getUserRole().equals("TEACHER")) {
                    sortedUsers.get("TEACHERS").add(user);
                } else if (user.getUserRole().equals("STUDENT")) {
                    sortedUsers.get("STUDENTS").add(user);
                }
            }
            
            return ResponseUtil.success("Users sorted by role retrieved successfully", sortedUsers);
        } catch (Exception e) {
            return ResponseUtil.serverError("Failed to fetch users: " + e.getMessage());
        }
    }

    // Test endpoint to check authentication
    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth() {
        try {
            // Get the authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                return ResponseEntity.status(401).body("No authentication found");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", authentication.isAuthenticated());
            response.put("principal", authentication.getPrincipal());
            response.put("name", authentication.getName());
            response.put("details", authentication.getDetails());
            response.put("credentials", "REDACTED");
            response.put("authorities", authentication.getAuthorities());
            
            // Try to find user
            String userIdentifier = authentication.getName();
            UserEntity user = userRepository.findByUserEmail(userIdentifier);
            
            if (user == null) {
                user = userRepository.findByUserName(userIdentifier);
            }
            
            if (user != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getUserId());
                userInfo.put("name", user.getUserName());
                userInfo.put("email", user.getUserEmail());
                userInfo.put("role", user.getUserRole());
                response.put("user", userInfo);
            } else {
                response.put("userFound", false);
                response.put("userIdentifier", userIdentifier);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error checking authentication: " + e.getMessage());
        }
    }
}
