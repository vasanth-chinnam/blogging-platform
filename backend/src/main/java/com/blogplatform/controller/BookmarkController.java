package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.service.BookmarkService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/toggle/{postId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Boolean>> toggleBookmark(@PathVariable Long postId, Authentication auth) {
        boolean bookmarked = bookmarkService.toggleBookmark(postId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success(bookmarked ? "Post bookmarked" : "Bookmark removed", bookmarked));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getBookmarks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(bookmarkService.getBookmarkedPosts(auth.getName(), page, size)));
    }
}
