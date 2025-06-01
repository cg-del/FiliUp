package edu.cit.filiup.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:dqv26p8im}")
    private String cloudName;

    @Value("${cloudinary.api-key:212796575835275}")
    private String apiKey;

    @Value("${cloudinary.api-secret:F17PBi8thXC7L2x5_yb2vVlAgJ8}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        config.put("secure", "true");
        
        return new Cloudinary(config);
    }
} 