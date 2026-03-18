package com.blogplatform.controller;

import com.blogplatform.dto.*;
import com.blogplatform.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getUserProfile(
            @PathVariable String username, Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(ApiResponse.success(userService.getUserProfileByUsername(username, currentUsername)));
    }

    @PostMapping("/{userId}/follow")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Boolean>> toggleFollow(@PathVariable Long userId, Authentication auth) {
        boolean following = userService.toggleFollow(userId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success(following ? "Now following" : "Unfollowed", following));
    }

    @GetMapping("/me/feed")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<PagedResponse<PostSummaryDto>>> getPersonalizedFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getPersonalizedFeed(auth.getName(), page, size)));
    }
}
