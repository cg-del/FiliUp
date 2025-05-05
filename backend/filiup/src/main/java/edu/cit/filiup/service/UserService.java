package edu.cit.filiup.service;

import edu.cit.filiup.entity.UserEntity;
import edu.cit.filiup.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.NameNotFoundException;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService {

    @Autowired
    UserRepository urepo;

    public UserService() {
        super();
        // TODO Auto-generated constructor stub
    }

    public UserEntity postUser(UserEntity user) {
        return urepo.save(user);
    }

    public List<UserEntity> getAllUser() {
        return urepo.findAll();
    }

    @SuppressWarnings("finally")
    public UserEntity putUser(int userId, UserEntity newUserDetails) {
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
            user.setUserPassword(newUserDetails.getUserPassword());
            user.setUserRole(newUserDetails.getUserRole());

        } catch (NoSuchElementException nex) {
            throw new NameNotFoundException("User " + userId + " not found!");
        } finally {
            return urepo.save(user);
        }
    }

    public String deleteUser(int id) {
        String msg = "";
        if (urepo.findById(id) != null) {
            urepo.deleteById(id);
            msg = "User successfully deleted.";
        } else
            msg = id + " not found.";
        return msg;
    }

    // Signup Method
    public UserEntity registerUser(UserEntity user) {
        // Check if the user already exists
        if (urepo.findByUserEmail(user.getUserEmail()) != null) {
            throw new IllegalArgumentException("User already exists with this email.");
        }
        
        // Validate role
        String role = user.getUserRole();
        if (role == null || (!role.equals("STUDENT") && !role.equals("TEACHER"))) {
            throw new IllegalArgumentException("Invalid user role. Must be either STUDENT or TEACHER.");
        }
        
        return urepo.save(user);
    }

    // Login Method
    public UserEntity loginUser(String email, String password) {
        UserEntity user = urepo.findByUserEmail(email);
        if (user != null && user.getUserPassword().equals(password)) {
            return user; // Successful login
        }
        return null; // Login failed
    }

    public UserEntity getUserByEmail(String email) {
        return urepo.findByUserEmail(email);
    }
}