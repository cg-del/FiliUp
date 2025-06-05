package edu.cit.filiup.config;

import edu.cit.filiup.util.JwtUtil;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Map;

public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                 WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        System.out.println("WebSocket handshake interceptor - checking authentication");
        
        String token = null;
        
        // Try to get token from query parameter first
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String queryString = servletRequest.getServletRequest().getQueryString();
            
            if (queryString != null) {
                String[] params = queryString.split("&");
                for (String param : params) {
                    if (param.startsWith("token=")) {
                        token = param.substring(6); // Remove "token="
                        try {
                            token = java.net.URLDecoder.decode(token, "UTF-8");
                        } catch (Exception e) {
                            System.err.println("Error decoding token: " + e.getMessage());
                        }
                        break;
                    }
                }
            }
        }
        
        // If no token in query params, try Authorization header
        if (token == null) {
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }
        
        if (token == null) {
            System.err.println("No JWT token found in WebSocket handshake");
            return false;
        }
        
        // Validate the token
        if (!JwtUtil.validateToken(token)) {
            System.err.println("Invalid JWT token in WebSocket handshake");
            return false;
        }
        
        // Extract user information from token
        String username = JwtUtil.extractUsername(token);
        String role = JwtUtil.extractRole(token);
        
        if (username == null) {
            System.err.println("No username found in JWT token");
            return false;
        }
        
        // Store authentication info in WebSocket session attributes
        attributes.put("username", username);
        attributes.put("role", role);
        attributes.put("token", token);
        
        System.out.println("WebSocket authentication successful for user: " + username + " with role: " + role);
        
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        // Nothing to do after handshake
        if (exception != null) {
            System.err.println("WebSocket handshake failed: " + exception.getMessage());
        } else {
            System.out.println("WebSocket handshake completed successfully");
        }
    }
} 