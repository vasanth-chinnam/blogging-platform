package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<List<CommentDto>>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(ApiResponse.success(commentService.getCommentsByPost(postId)));
    }

    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Comment added",
            commentService.addComment(postId, request, auth.getName())));
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentDto>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Comment updated",
            commentService.updateComment(commentId, request, auth.getName())));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority).anyMatch(a -> a.equals("ROLE_ADMIN"));
        commentService.deleteComment(commentId, auth.getName(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}
