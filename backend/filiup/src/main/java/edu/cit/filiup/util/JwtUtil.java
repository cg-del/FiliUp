package edu.cit.filiup.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import java.nio.file.Paths;

public class JwtUtil {
    private static final Dotenv dotenv;
    private static final String SECRET_KEY;
    private static final long EXPIRATION_TIME = 86400000L; // 1 day
    private static final SecretKey key;

    static {
        System.out.println("Initializing JwtUtil...");
        try {
            dotenv = Dotenv.load();
            System.out.println("Dotenv loaded successfully");
            System.out.println("Current working directory: " + System.getProperty("user.dir"));
            
            SECRET_KEY = dotenv.get("JWT_SECRET_KEY");
            System.out.println("JWT_SECRET_KEY from .env: " + (SECRET_KEY != null ? "***" : "null"));
            System.out.println("All environment variables: " + dotenv.entries());
            
            if (SECRET_KEY == null || SECRET_KEY.isEmpty()) {
                throw new RuntimeException("JWT_SECRET_KEY is null or empty");
            }
            
            try {
                key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
                System.out.println("Key generated successfully");
            } catch (Exception e) {
                System.err.println("Error generating key: " + e.getMessage());
                throw new RuntimeException("Failed to generate key from secret", e);
            }
            
            System.out.println("JwtUtil initialized successfully");
        } catch (Exception e) {
            System.err.println("Error initializing JwtUtil: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to initialize JwtUtil", e);
        }
    }

    public static String generateToken(String subject) {
        try {
            System.out.println("Generating token for subject: " + subject);
            String token = Jwts.builder()
                    .subject(subject)
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                    .signWith(key)
                    .compact();
            System.out.println("Token generated successfully");
            return token;
        } catch (Exception e) {
            System.err.println("Error generating token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            System.err.println("Error validating token: " + e.getMessage());
            return false;
        }
    }

    public static String extractUsername(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            System.err.println("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }
}