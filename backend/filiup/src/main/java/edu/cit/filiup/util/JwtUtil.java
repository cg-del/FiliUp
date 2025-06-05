package edu.cit.filiup.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {
    private static final long EXPIRATION_TIME = 432000000L; // 5 days
    private static final long REFRESH_EXPIRATION_TIME = 604800000L; // 7 days
    private static final SignatureAlgorithm ALGORITHM = SignatureAlgorithm.HS256;
    
    private static SecretKey secretKey;
    
    @Value("${JWT_SECRET_KEY}")
    private String secretKeyString;
    
    @PostConstruct
    public void init() {
        secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        System.out.println("JwtUtil initialized successfully with key");
    }

    public static Map<String, String> generateTokens(String subject, String role) {
        if (secretKey == null) {
            throw new IllegalStateException("JWT Secret Key not initialized");
        }
        
        // Validate and normalize role
        if (role == null || role.trim().isEmpty()) {
            System.err.println("Warning: Null or empty role provided for JWT token. Defaulting to 'STUDENT'");
            role = "STUDENT";
        }
        
        // Normalize role to uppercase and remove any SCOPE_ prefix if it exists
        role = role.trim().toUpperCase();
        if (role.startsWith("SCOPE_")) {
            role = role.substring(6);
        }
        
        // Ensure role is one of the valid types
        if (!role.equals("STUDENT") && !role.equals("TEACHER") && !role.equals("ADMIN")) {
            System.err.println("Warning: Invalid role '" + role + "' provided for JWT token. Defaulting to 'STUDENT'");
            role = "STUDENT";
        }
        
        System.out.println("Generating JWT tokens for subject: " + subject + ", role: " + role);
        
        try {
            String jti = UUID.randomUUID().toString();
            Date now = new Date();
            Date accessExpiration = new Date(now.getTime() + EXPIRATION_TIME);
            Date refreshExpiration = new Date(now.getTime() + REFRESH_EXPIRATION_TIME);

            // Generate access token
            String accessToken = Jwts.builder()
                    .subject(subject)
                    .issuedAt(now)
                    .expiration(accessExpiration)
                    .claim("type", "access")
                    .claim("jti", jti)
                    .claim("role", role)
                    .signWith(secretKey, ALGORITHM)
                    .compact();

            // Generate refresh token
            String refreshToken = Jwts.builder()
                    .subject(subject)
                    .issuedAt(now)
                    .expiration(refreshExpiration)
                    .claim("type", "refresh")
                    .claim("jti", jti)
                    .claim("role", role)
                    .signWith(secretKey, ALGORITHM)
                    .compact();

            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
            
            System.out.println("JWT tokens generated successfully");
            return tokens;
        } catch (Exception e) {
            System.err.println("Error generating tokens: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Overload for backward compatibility
    public static Map<String, String> generateTokens(String subject) {
        System.out.println("Warning: generateTokens called without role parameter for subject: " + subject);
        return generateTokens(subject, "STUDENT"); // Default role
    }

    public static boolean validateToken(String token) {
        if (secretKey == null) {
            System.err.println("JWT Secret Key not initialized");
            return false;
        }
        
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            // Validate token type
            String type = claims.get("type", String.class);
            if (type == null || (!type.equals("access") && !type.equals("refresh"))) {
                System.out.println("Token validation failed: Invalid token type: " + type);
                return false;
            }

            System.out.println("Token validated successfully for subject: " + claims.getSubject());
            System.out.println("Token contains role: " + claims.get("role"));
            return true;
        } catch (ExpiredJwtException e) {
            System.err.println("Token expired: " + e.getMessage());
            return false;
        } catch (SignatureException e) {
            System.err.println("Invalid signature: " + e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            System.err.println("Malformed token: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Error validating token: " + e.getMessage());
            return false;
        }
    }

    public static String extractUsername(String token) {
        if (secretKey == null) {
            System.err.println("JWT Secret Key not initialized");
            return null;
        }
        
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            System.err.println("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }

    public static String extractRole(String token) {
        if (secretKey == null) {
            System.err.println("JWT Secret Key not initialized");
            return null;
        }
        
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            String role = claims.get("role", String.class);
            System.out.println("Extracted role from token: " + role);
            return role;
        } catch (Exception e) {
            System.err.println("Error extracting role from token: " + e.getMessage());
            return null;
        }
    }

    public static boolean isTokenExpired(String token) {
        if (secretKey == null) {
            return true;
        }
        
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            boolean expired = claims.getExpiration().before(new Date());
            if (expired) {
                System.out.println("Token has expired");
            }
            return expired;
        } catch (Exception e) {
            System.err.println("Error checking token expiration: " + e.getMessage());
            return true;
        }
    }
}