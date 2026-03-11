package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAll() {
        List<CategoryDto> cats = categoryRepository.findAll().stream()
            .map(c -> CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .color(c.getColor())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(cats));
    }
}
