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
        // Skip if not a handler method (e.g., resource requests)
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole methodAnnotation = handlerMethod.getMethod().getAnnotation(RequireRole.class);
        RequireRole classAnnotation = handlerMethod.getBeanType().getAnnotation(RequireRole.class);

        // If no role requirements, allow access
        if (methodAnnotation == null && classAnnotation == null) {
            return true;
        }

        // Get required roles (method annotation overrides class annotation)
        String[] requiredRoles = methodAnnotation != null ? methodAnnotation.value() : classAnnotation.value();

        // If no specific roles required, allow access
        if (requiredRoles.length == 0) {
            return true;
        }

        // Extract authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}");
            return false;
        }

        // Extract token
        String token = authHeader.substring(7);
        String userRole = JwtUtil.extractRole(token);

        // Check if user has required role
        if (userRole == null || !Arrays.asList(requiredRoles).contains(userRole)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"Insufficient permissions\"}");
            return false;
        }

        return true;
    }
} 