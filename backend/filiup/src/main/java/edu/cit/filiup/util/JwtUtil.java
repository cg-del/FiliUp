package edu.cit.filiup.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import java.nio.file.Paths;

public class JwtUtil {
    private static final Dotenv dotenv;
    private static final String SECRET_KEY;
    private static final long EXPIRATION_TIME = 3600000L; // 1 hour
    private static final long REFRESH_EXPIRATION_TIME = 604800000L; // 7 days
    private static final SecretKey key;
    private static final SignatureAlgorithm ALGORITHM = SignatureAlgorithm.HS256;

    static {
        System.out.println("Initializing JwtUtil...");
        try {
            dotenv = Dotenv.load();
            System.out.println("Dotenv loaded successfully");
            
            SECRET_KEY = dotenv.get("JWT_SECRET_KEY");
            if (SECRET_KEY == null || SECRET_KEY.isEmpty() || SECRET_KEY.length() < 32) {
                throw new RuntimeException("JWT_SECRET_KEY must be at least 32 characters long");
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

    public static Map<String, String> generateTokens(String subject) {
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
                    .signWith(key, ALGORITHM)
                    .compact();

            // Generate refresh token
            String refreshToken = Jwts.builder()
                    .subject(subject)
                    .issuedAt(now)
                    .expiration(refreshExpiration)
                    .claim("type", "refresh")
                    .claim("jti", jti)
                    .signWith(key, ALGORITHM)
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

    public static boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
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

    public static boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}