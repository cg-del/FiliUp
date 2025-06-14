package edu.cit.filiup.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ResponseUtil {

    public static ResponseEntity<?> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", HttpStatus.OK.value());
        response.put("message", message);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    public static ResponseEntity<?> success(String message) {
        return success(message, null);
    }

    public static ResponseEntity<?> error(HttpStatus status, String message, String errorCode) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        response.put("errorCode", errorCode);
        return ResponseEntity.status(status).body(response);
    }

    public static ResponseEntity<?> error(HttpStatus status, String message, String errorCode, Object debugData) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        response.put("errorCode", errorCode);
        response.put("debug", debugData);
        return ResponseEntity.status(status).body(response);
    }

    public static ResponseEntity<?> badRequest(String message) {
        return error(HttpStatus.BAD_REQUEST, message, "BAD_REQUEST");
    }

    public static ResponseEntity<?> unauthorized(String message) {
        return error(HttpStatus.UNAUTHORIZED, message, "UNAUTHORIZED");
    }

    public static ResponseEntity<?> forbidden(String message) {
        return error(HttpStatus.FORBIDDEN, message, "FORBIDDEN");
    }

    public static ResponseEntity<?> notFound(String message) {
        return error(HttpStatus.NOT_FOUND, message, "NOT_FOUND");
    }

    public static ResponseEntity<?> serverError(String message) {
        return error(HttpStatus.INTERNAL_SERVER_ERROR, message, "SERVER_ERROR");
    }
} 