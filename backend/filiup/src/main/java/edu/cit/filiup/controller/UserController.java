package edu.cit.filiup.controller;

import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<UserEntity> signup(@RequestBody UserEntity user) {
        UserEntity newUser = userv.registerUser(user);
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<UserEntity> login(@RequestBody UserEntity user) {
        UserEntity loggedInUser = userv.loginUser(user.getUserEmail(), user.getUserPassword());
        if (loggedInUser != null) {
            return ResponseEntity.ok(loggedInUser);
        }
        return ResponseEntity.status(401).body(null); // Unauthorized
    }
}
