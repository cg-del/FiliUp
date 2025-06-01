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
    private static final long EXPIRATION_TIME = 3600000L; // 1 hour
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
            return tokens;
        } catch (Exception e) {
            System.err.println("Error generating tokens: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Overload for backward compatibility
    public static Map<String, String> generateTokens(String subject) {
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
                return false;
            }

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
            return claims.get("role", String.class);
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
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}