package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.service.AiService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/suggest-titles")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<String>>> suggestTitles(@RequestBody AiContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiService.suggestTitles(request.content)));
    }

    @PostMapping("/suggest-summary")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> suggestSummary(@RequestBody AiContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiService.generateSummary(request.content)));
    }

    @PostMapping("/suggest-tags")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<String>>> suggestTags(@RequestBody AiContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiService.suggestTags(request.content)));
    }

    @PostMapping("/improve-writing")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<String>> improveWriting(@RequestBody AiContentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiService.improveWriting(request.content)));
    }
}
