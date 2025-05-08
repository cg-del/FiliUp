package edu.cit.filiup.controller;

import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    @Autowired
    UserService userv;

    @PostMapping("/postUser")
    public UserEntity postUser(@RequestBody UserEntity user) {
        return userv.postUser(user);
    }
    @GetMapping("/getAllUser")
    public List<UserEntity> getAllUser(){
        return userv.getAllUser();
    }
    @PutMapping("/putUser")
    public UserEntity putUser(@RequestParam int id, @RequestBody UserEntity newUserDetails) {
        return userv.putUser(id, newUserDetails);
    }
    @DeleteMapping("/deleteUser")
    public String deleteUser(@PathVariable int id) {
        return userv.deleteUser(id);
    }
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserEntity user) {
        UserEntity newUser = userv.registerUser(user);
        if (newUser != null) {
            Map<String, String> tokens = JwtUtil.generateTokens(newUser.getUserEmail());
            return ResponseEntity.ok(tokens);
        }
        return ResponseEntity.badRequest().body("Registration failed");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserEntity user) {
        UserEntity loggedInUser = userv.loginUser(user.getUserEmail(), user.getUserPassword());
        if (loggedInUser != null) {
            Map<String, String> tokens = JwtUtil.generateTokens(loggedInUser.getUserEmail());
            return ResponseEntity.ok(tokens);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
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
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(404).body(Map.of("error", "User not found", "email", email));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication failed", "message", e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.status(401).body("No refresh token provided");
        }

        try {
            if (JwtUtil.validateToken(refreshToken) && !JwtUtil.isTokenExpired(refreshToken)) {
                String userEmail = JwtUtil.extractUsername(refreshToken);
                UserEntity user = userv.getUserByEmail(userEmail);
                if (user != null) {
                    Map<String, String> tokens = JwtUtil.generateTokens(user.getUserEmail());
                    return ResponseEntity.ok(tokens);
                }
            }
            return ResponseEntity.status(401).body("Invalid refresh token");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token refresh failed");
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null) {
            return ResponseEntity.status(401).body("No token provided");
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
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.status(401).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token verification failed");
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
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(404)
                .body(Map.of("error", "User not found", "email", email));
        } catch (Exception e) {
            System.err.println("Error in hello endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401)
                .body(Map.of("error", "Authentication failed", "message", e.getMessage()));
        }
    }
    
}
