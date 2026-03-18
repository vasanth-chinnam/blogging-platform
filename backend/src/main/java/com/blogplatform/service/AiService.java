package com.blogplatform.service;

import com.blogplatform.dto.AiSuggestionDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class AiService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private String callGemini(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key not configured. Using fallback.");
            return null;
        }

        try {
            String url = GEMINI_URL + "?key=" + apiKey;

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> contentPart = Map.of("parts", List.of(textPart));
            Map<String, Object> body = Map.of("contents", List.of(contentPart));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        return parts.get(0).path("text").asText();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
        }
        return null;
    }

    public List<String> suggestTitles(String content) {
        String prompt = "Given this blog post content, suggest exactly 3 alternative engaging titles. Return ONLY the titles, one per line, numbered 1-3. No extra text.\n\nContent:\n" + truncate(content, 2000);
        String result = callGemini(prompt);
        if (result != null) {
            return parseNumberedList(result);
        }
        // Fallback
        return List.of(
            "A Deep Dive Into " + extractFirstWords(content, 5),
            "Everything You Need to Know About " + extractFirstWords(content, 3),
            "The Complete Guide to " + extractFirstWords(content, 4)
        );
    }

    public String generateSummary(String content) {
        String prompt = "Summarize this blog post in 2-3 concise sentences. Return ONLY the summary, no extra text.\n\nContent:\n" + truncate(content, 3000);
        String result = callGemini(prompt);
        if (result != null) {
            return result.trim();
        }
        // Fallback: first 200 chars
        String plain = content.replaceAll("[#*`>\\[\\]()]", "").replaceAll("\\s+", " ").trim();
        return plain.length() > 200 ? plain.substring(0, 200) + "..." : plain;
    }

    public List<String> suggestTags(String content) {
        String prompt = "Extract 3-5 relevant tags/keywords from this blog post content. Return ONLY the tags, one per line, no numbering, no hashtags, no extra text.\n\nContent:\n" + truncate(content, 2000);
        String result = callGemini(prompt);
        if (result != null) {
            return Arrays.stream(result.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .limit(5)
                .toList();
        }
        // Fallback
        return List.of("General");
    }

    public String improveWriting(String content) {
        String prompt = "Improve the grammar and readability of this blog post. Keep the same structure and meaning. Return ONLY the improved content, no extra commentary.\n\nContent:\n" + truncate(content, 4000);
        String result = callGemini(prompt);
        return result != null ? result.trim() : content;
    }

    private String truncate(String text, int maxLen) {
        return text.length() > maxLen ? text.substring(0, maxLen) : text;
    }

    private String extractFirstWords(String content, int count) {
        String plain = content.replaceAll("[#*`>\\[\\]()]", "").trim();
        String[] words = plain.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(count, words.length); i++) {
            if (i > 0) sb.append(" ");
            sb.append(words[i]);
        }
        return sb.toString();
    }

    private List<String> parseNumberedList(String text) {
        List<String> items = new ArrayList<>();
        for (String line : text.split("\n")) {
            String cleaned = line.replaceAll("^\\d+[.)\\s]*", "").trim();
            if (!cleaned.isEmpty()) {
                items.add(cleaned);
            }
        }
        return items.isEmpty() ? List.of("Untitled") : items;
    }
}
