package edu.cit.filiup.controller;

import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.UserService;
import edu.cit.filiup.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
            String token = JwtUtil.generateToken(newUser.getUserEmail());
            return ResponseEntity.ok(Map.of("token", token));
        }
        return ResponseEntity.badRequest().body("Registration failed");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserEntity user) {
        UserEntity loggedInUser = userv.loginUser(user.getUserEmail(), user.getUserPassword());
        
        if (loggedInUser != null) {
            String token = JwtUtil.generateToken(loggedInUser.getUserEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("userName", loggedInUser.getUserName());
            response.put("userRole", loggedInUser.getUserRole());
            response.put("userEmail", loggedInUser.getUserEmail());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
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

    @PostMapping("/Hello")
    public String Hello(){
        return "Hello";
    }
    
}
