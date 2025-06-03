package edu.cit.filiup.service;

import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.naming.NameNotFoundException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    UserRepository urepo;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService() {
        super();
        // TODO Auto-generated constructor stub
    }

    public UserEntity postUser(UserEntity user) {
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        return urepo.save(user);
    }

    public List<UserEntity> getAllUser() {
        return urepo.findAll();
    }

    @SuppressWarnings("finally")
    public UserEntity putUser(UUID userId, UserEntity newUserDetails) {
        UserEntity user = new UserEntity();

        try {
            user = urepo.findById(userId).get();

            // user.setTimers(newUserDetails.getTimers());
            // user.setStickyNotes(newUserDetails.getStickyNotes());
            // user.setTasks(newUserDetails.getTasks());
            // user.setAnalytics(newUserDetails.getAnalytics());
            // user.setDeadlineTasks(newUserDetails.getDeadlineTasks());

            user.setUserName(newUserDetails.getUserName());
            user.setUserEmail(newUserDetails.getUserEmail());
            
            // Only update password if a new one is provided
            if (newUserDetails.getUserPassword() != null && !newUserDetails.getUserPassword().isEmpty()) {
                user.setUserPassword(passwordEncoder.encode(newUserDetails.getUserPassword()));
            }
            
            user.setUserRole(newUserDetails.getUserRole());

        } catch (NoSuchElementException nex) {
            throw new NameNotFoundException("User " + userId + " not found!");
        } finally {
            return urepo.save(user);
        }
    }

    public String deleteUser(UUID id) {
        if (!urepo.existsById(id)) {
            throw new NoSuchElementException("User with ID " + id + " not found");
        }
        urepo.deleteById(id);
        return "User successfully deleted";
    }

    // Signup Method
    public UserEntity registerUser(UserEntity user) {
        // Check if the user already exists
        if (urepo.findByUserEmail(user.getUserEmail()) != null) {
            throw new IllegalArgumentException("User already exists with this email.");
        }
        
        // Validate role
        String role = user.getUserRole();
        if (role == null || (!role.equals("STUDENT") && !role.equals("TEACHER") && !role.equals("ADMIN"))) {
            throw new IllegalArgumentException("Invalid user role. Must be either STUDENT, TEACHER, or ADMIN.");
        }
        
        // Encode password before saving
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        
        return urepo.save(user);
    }

    // Login Method
    public UserEntity loginUser(String email, String password) {
        UserEntity user = urepo.findByUserEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getUserPassword())) {
            return user; // Successful login
        }
        return null; // Login failed
    }

    // Login Method by Username
    public UserEntity loginUserByUsername(String username, String password) {
        UserEntity user = urepo.findByUserName(username);
        if (user != null && passwordEncoder.matches(password, user.getUserPassword())) {
            return user; // Successful login
        }
        return null; // Login failed
    }

    public UserEntity getUserByEmail(String email) {
        return urepo.findByUserEmail(email);
    }

    public UserEntity getUserByUsername(String username) {
        return urepo.findByUserName(username);
    }
}