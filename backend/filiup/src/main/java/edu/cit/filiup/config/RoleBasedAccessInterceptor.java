package edu.cit.filiup.config;

import edu.cit.filiup.util.JwtUtil;
import edu.cit.filiup.util.RequireRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

@Component
public class RoleBasedAccessInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("RoleBasedAccessInterceptor processing request: " + request.getRequestURI());
        
        // Skip if not a handler method (e.g., resource requests)
        if (!(handler instanceof HandlerMethod)) {
            System.out.println("Not a handler method, skipping role check");
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole methodAnnotation = handlerMethod.getMethod().getAnnotation(RequireRole.class);
        RequireRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequireRole.class);

        // If no role requirements, allow access
        if (methodAnnotation == null && classAnnotation == null) {
            System.out.println("No @RequireRole annotation found, allowing access");
            return true;
        }

        // Get required roles (method annotation overrides class annotation)
        String[] requiredRoles = methodAnnotation != null ? methodAnnotation.value() : classAnnotation.value();
        System.out.println("Required roles: " + Arrays.toString(requiredRoles));

        // If no specific roles required, allow access
        if (requiredRoles.length == 0) {
            System.out.println("No specific roles required, allowing access");
            return true;
        }

        // Extract authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("Authorization header missing or invalid");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}");
            return false;
        }

        // Extract token
        String token = authHeader.substring(7);
        System.out.println("JWT token: " + token.substring(0, Math.min(token.length(), 20)) + "...");
        
        // Validate token before extracting role
        if (!JwtUtil.validateToken(token)) {
            System.out.println("JWT token validation failed");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Invalid token\"}");
            return false;
        }
        
        String userRole = JwtUtil.extractRole(token);
        System.out.println("Extracted role from token: " + userRole);

        // Check if user has required role
        if (userRole == null) {
            System.out.println("No role found in token");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Role information missing\"}");
            return false;
        }
        
        // Check if the role has a SCOPE_ prefix and remove it
        if (userRole.startsWith("SCOPE_")) {
            userRole = userRole.substring(6);
            System.out.println("Removed SCOPE_ prefix, adjusted role: " + userRole);
        }
        
        if (!Arrays.asList(requiredRoles).contains(userRole)) {
            System.out.println("User role '" + userRole + "' does not match any required roles");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Insufficient permissions\"}");
            return false;
        }

        System.out.println("Role check passed, allowing access");
        return true;
    }
} 