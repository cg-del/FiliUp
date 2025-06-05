package edu.cit.filiup.controller;

import edu.cit.filiup.service.QuizTimerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
public class QuizWebSocketController {

    private final QuizTimerService quizTimerService;

    @Autowired
    public QuizWebSocketController(QuizTimerService quizTimerService) {
        this.quizTimerService = quizTimerService;
    }

    /**
     * Handle student connecting to quiz session
     */
    @MessageMapping("/quiz/connect")
    public void connectToQuiz(@Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        try {
            String studentIdStr = payload.get("studentId");
            String sessionId = headerAccessor.getSessionId();
            
            if (studentIdStr != null) {
                UUID studentId = UUID.fromString(studentIdStr);
                quizTimerService.addStudentSession(studentId, sessionId);
                System.out.println("Student " + studentId + " connected to quiz session: " + sessionId);
            }
        } catch (Exception e) {
            System.err.println("Error connecting student to quiz: " + e.getMessage());
        }
    }

    /**
     * Handle student disconnecting from quiz session
     */
    @MessageMapping("/quiz/disconnect")
    public void disconnectFromQuiz(@Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        try {
            String studentIdStr = payload.get("studentId");
            
            if (studentIdStr != null) {
                UUID studentId = UUID.fromString(studentIdStr);
                quizTimerService.removeStudentSession(studentId);
                System.out.println("Student " + studentId + " disconnected from quiz session");
            }
        } catch (Exception e) {
            System.err.println("Error disconnecting student from quiz: " + e.getMessage());
        }
    }

    /**
     * Handle quiz heartbeat to ensure connection is alive
     */
    @MessageMapping("/quiz/heartbeat")
    public void handleHeartbeat(@Payload Map<String, String> payload) {
        // Simple heartbeat handler - could be used for connection monitoring
        System.out.println("Received heartbeat from student: " + payload.get("studentId"));
    }
} 