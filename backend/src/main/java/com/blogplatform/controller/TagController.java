package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TagDto>>> getAll() {
        List<TagDto> tags = tagRepository.findAll().stream()
            .map(t -> TagDto.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(tags));
    }
}
