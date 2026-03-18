package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Blog post management APIs")
public class PostController {

    private final PostService postService;

    @GetMapping
    @Operation(summary = "Get all published posts")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getAllPublishedPosts(page, size, sortBy, username)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search posts")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> searchPosts(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        if (author != null || tag != null || category != null || from != null || to != null) {
            return ResponseEntity.ok(ApiResponse.success(
                postService.advancedSearch(q, author, tag, category, from, to, page, size, username)));
        }
        return ResponseEntity.ok(ApiResponse.success(postService.searchPosts(q != null ? q : "", page, size, username)));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending posts")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getTrending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getTrendingPosts(page, size, username)));
    }

    @GetMapping("/{id}/recommended")
    @Operation(summary = "Get recommended posts for a given post")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getRecommended(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int size,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getRecommendedPosts(id, size, username)));
    }

    @GetMapping("/tag/{tagSlug}")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getByTag(
            @PathVariable String tagSlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getPostsByTag(tagSlug, page, size, username)));
    }

    @GetMapping("/category/{categorySlug}")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getByCategory(
            @PathVariable String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getPostsByCategory(categorySlug, page, size, username)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDetailDto>> getById(@PathVariable Long id, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getPostById(id, username)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<PostDetailDto>> getBySlug(@PathVariable String slug, Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(postService.getPostBySlug(slug, username)));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(postService.getMyPosts(auth.getName(), page, size)));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new post")
    public ResponseEntity<ApiResponse<PostDetailDto>> createPost(
            @Valid @RequestBody CreatePostRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Post created successfully",
            postService.createPost(request, auth.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PostDetailDto>> updatePost(
            @PathVariable Long id,
            @RequestBody UpdatePostRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully",
            postService.updatePost(id, request, auth.getName())));
    }

    @PutMapping("/{id}/autosave")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> autoSave(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        postService.autoSave(id, body.get("content"), auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Auto-saved", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority).anyMatch(a -> a.equals("ROLE_ADMIN"));
        postService.deletePost(id, auth.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Boolean>> toggleLike(@PathVariable Long id, Authentication auth) {
        boolean liked = postService.toggleLike(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success(liked ? "Post liked" : "Post unliked", liked));
    }

    @PostMapping("/{id}/react")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleReaction(
            @PathVariable Long id,
            @RequestBody ReactionRequest request,
            Authentication auth) {
        Map<String, Object> result = postService.toggleReaction(id, request.type, auth.getName());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
    @GetMapping("/{id}/versions")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<java.util.List<PostVersionDto>>> getVersions(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(postService.getPostVersions(id, auth.getName())));
    }
}
