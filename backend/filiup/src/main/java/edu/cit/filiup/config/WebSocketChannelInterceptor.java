package edu.cit.filiup.config;

import edu.cit.filiup.util.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;

public class WebSocketChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            System.out.println("WebSocket STOMP CONNECT interceptor");
            
            String token = null;
            
            // Try to get token from Authorization header
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            
            // If no Authorization header, try to get from session attributes (set by handshake interceptor)
            if (token == null) {
                Object sessionToken = accessor.getSessionAttributes().get("token");
                if (sessionToken instanceof String) {
                    token = (String) sessionToken;
                }
            }
            
            if (token != null && JwtUtil.validateToken(token)) {
                String username = JwtUtil.extractUsername(token);
                String role = JwtUtil.extractRole(token);
                
                if (username != null) {
                    // Create authentication object
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + (role != null ? role : "USER"))
                    );
                    
                    UsernamePasswordAuthenticationToken auth = 
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                    
                    // Set in security context
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    
                    // Store user info in accessor for later use
                    accessor.setUser(auth);
                    
                    System.out.println("WebSocket authentication successful for user: " + username + " with role: " + role);
                } else {
                    System.err.println("No username found in JWT token during STOMP CONNECT");
                }
            } else {
                System.err.println("Invalid or missing JWT token during STOMP CONNECT");
            }
        }
        
        return message;
    }
} 