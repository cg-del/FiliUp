package edu.cit.filiup.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Service
public class AIService {

    @Value("${gemini.api.key:AIzaSyDjfoHpmHoWp_P4TxBRAXEF7d7PeFUWofo}")
    private String apiKey;
    
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
    
    /**
     * Generates a story in Tagalog based on the provided prompt
     * 
     * @param prompt The prompt describing what the story should be about
     * @return The generated story in Tagalog
     */
    public String generateStory(String prompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", "Generate a creative story in Tagalog (Filipino) based on this prompt: " + prompt + 
                      ". The story should be engaging, appropriate for students, and approximately 500 words long. " + 
                      "Make sure it's completely in Tagalog language with proper grammar and natural flow.");
            
            List<Map<String, Object>> partsList = new ArrayList<>();
            partsList.add(parts);
            
            content.put("parts", partsList);
            contents.add(content);
            
            requestBody.put("contents", contents);
            
            // Create the HTTP entity
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make the API call
            ResponseEntity<Map> response = restTemplate.postForEntity(
                GEMINI_API_URL + "?key=" + apiKey, 
                entity, 
                Map.class
            );
            
            // Process the response to extract the generated text
            if (response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> candidateContent = (Map<String, Object>) candidate.get("content");
                    
                    if (candidateContent != null) {
                        List<Map<String, Object>> candidateParts = (List<Map<String, Object>>) candidateContent.get("parts");
                        
                        if (candidateParts != null && !candidateParts.isEmpty()) {
                            return (String) candidateParts.get(0).get("text");
                        }
                    }
                }
            }
            
            return "Hindi nagtagumpay ang paggawa ng kwento. Paumanhin po."; // Failed to generate story
        } catch (Exception e) {
            e.printStackTrace();
            return "May naganap na error: " + e.getMessage(); // An error occurred
        }
    }
} 