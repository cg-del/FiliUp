package edu.cit.filiup.service;

import edu.cit.filiup.dto.QuizSubmissionDTO;
import edu.cit.filiup.entity.QuizAttemptEntity;
import edu.cit.filiup.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
public class QuizTimerService {

    private final SimpMessagingTemplate messagingTemplate;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);
    
    // Map to store active timers so they can be cancelled if needed
    private final ConcurrentHashMap<UUID, ScheduledFuture<?>> activeTimers = new ConcurrentHashMap<>();
    // Map to track student sessions
    private final ConcurrentHashMap<UUID, String> studentSessions = new ConcurrentHashMap<>();

    @Autowired
    public QuizTimerService(SimpMessagingTemplate messagingTemplate, 
                           QuizAttemptRepository quizAttemptRepository) {
        this.messagingTemplate = messagingTemplate;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    /**
     * Schedules a timeout for a quiz attempt
     */
    public void scheduleQuizTimeout(UUID attemptId, LocalDateTime expiresAt, UUID studentId) {
        // Calculate delay until expiration
        long delayInSeconds = Duration.between(LocalDateTime.now(), expiresAt).getSeconds();
        
        if (delayInSeconds <= 0) {
            // Already expired, handle immediately
            handleQuizTimeout(attemptId, studentId);
            return;
        }

        ScheduledFuture<?> timeoutTask = scheduler.schedule(() -> {
            handleQuizTimeout(attemptId, studentId);
        }, delayInSeconds, TimeUnit.SECONDS);

        // Store the task so it can be cancelled if needed
        activeTimers.put(attemptId, timeoutTask);
        
        System.out.println("Scheduled quiz timeout for attempt " + attemptId + " in " + delayInSeconds + " seconds");
    }

    /**
     * Handles quiz timeout by sending WebSocket message and marking as expired
     */
    @Async
    private void handleQuizTimeout(UUID attemptId, UUID studentId) {
        try {
            // Check if attempt is still active
            QuizAttemptEntity attempt = quizAttemptRepository.findById(attemptId).orElse(null);
            if (attempt == null || attempt.getIsCompleted()) {
                System.out.println("Quiz attempt " + attemptId + " already completed or not found");
                return;
            }

            System.out.println("Handling quiz timeout for attempt " + attemptId + " student " + studentId);

            // Send WebSocket timeout message to student
            Map<String, Object> timeoutMessage = new HashMap<>();
            timeoutMessage.put("type", "QUIZ_TIMEOUT");
            timeoutMessage.put("attemptId", attemptId.toString());
            timeoutMessage.put("message", "Time's up! The quiz has expired.");

            messagingTemplate.convertAndSendToUser(
                studentId.toString(), 
                "/queue/quiz", 
                timeoutMessage
            );

            // Mark the attempt as expired by setting completed time
            // The actual auto-submission will be handled by the frontend or a separate service call
            attempt.setCompletedAt(LocalDateTime.now());
            attempt.setIsCompleted(true);
            attempt.setTimeTakenMinutes(attempt.getQuiz().getTimeLimitMinutes());
            
            quizAttemptRepository.save(attempt);
            
            System.out.println("Marked quiz attempt " + attemptId + " as expired");

        } catch (Exception e) {
            System.err.println("Error handling quiz timeout for attempt " + attemptId + ": " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Clean up the timer
            activeTimers.remove(attemptId);
        }
    }

    /**
     * Cancels a scheduled timeout (called when quiz is submitted before timeout)
     */
    public void cancelQuizTimeout(UUID attemptId) {
        ScheduledFuture<?> task = activeTimers.remove(attemptId);
        if (task != null && !task.isDone()) {
            task.cancel(false);
            System.out.println("Cancelled quiz timeout for attempt " + attemptId);
        }
    }

    /**
     * Sends a warning message to student before timeout
     */
    public void sendTimeWarning(UUID attemptId, UUID studentId, int minutesRemaining) {
        Map<String, Object> warningMessage = new HashMap<>();
        warningMessage.put("type", "TIME_WARNING");
        warningMessage.put("attemptId", attemptId.toString());
        warningMessage.put("minutesRemaining", minutesRemaining);
        warningMessage.put("message", minutesRemaining + " minutes remaining!");

        messagingTemplate.convertAndSendToUser(
            studentId.toString(), 
            "/queue/quiz", 
            warningMessage
        );
    }

    /**
     * Tracks student WebSocket session
     */
    public void addStudentSession(UUID studentId, String sessionId) {
        studentSessions.put(studentId, sessionId);
    }

    /**
     * Removes student WebSocket session
     */
    public void removeStudentSession(UUID studentId) {
        studentSessions.remove(studentId);
    }
} 