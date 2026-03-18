package com.blogplatform.service;

import com.blogplatform.dto.*;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final BookmarkRepository bookmarkRepository;
    private final ReactionRepository reactionRepository;

    public UserSummaryDto getUserProfile(Long userId, String currentUsername) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toUserSummary(user, currentUsername);
    }

    public UserSummaryDto getUserProfileByUsername(String username, String currentUsername) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return toUserSummary(user, currentUsername);
    }

    @Transactional
    public boolean toggleFollow(Long targetUserId, String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        boolean isFollowing = currentUser.getFollowing().contains(targetUser);
        if (isFollowing) {
            currentUser.getFollowing().remove(targetUser);
        } else {
            currentUser.getFollowing().add(targetUser);
        }
        userRepository.save(currentUser);
        return !isFollowing;
    }

    public PagedResponse<PostSummaryDto> getPersonalizedFeed(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        List<Long> followedIds = user.getFollowing().stream()
            .map(User::getId)
            .collect(Collectors.toList());

        if (followedIds.isEmpty()) {
            // Fallback to trending if no follows
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postRepository.findTrendingPosts(pageable);
            return toPagedResponse(posts, username);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByAuthorIdIn(followedIds, pageable);
        return toPagedResponse(posts, username);
    }

    private UserSummaryDto toUserSummary(User user, String currentUsername) {
        boolean followed = false;
        if (currentUsername != null) {
            User current = userRepository.findByUsername(currentUsername).orElse(null);
            if (current != null) {
                followed = current.getFollowing().contains(user);
            }
        }
        return UserSummaryDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .avatarUrl(user.getAvatarUrl())
            .bio(user.getBio())
            .followersCount(user.getFollowersCount())
            .followingCount(user.getFollowingCount())
            .followedByCurrentUser(followed)
            .build();
    }

    private PagedResponse<PostSummaryDto> toPagedResponse(Page<Post> page, String currentUsername) {
        Long currentUserId = currentUsername != null
            ? userRepository.findByUsername(currentUsername).map(User::getId).orElse(null)
            : null;

        List<PostSummaryDto> content = page.getContent().stream()
            .map(p -> toSummaryDto(p, currentUsername, currentUserId))
            .collect(Collectors.toList());

        return PagedResponse.<PostSummaryDto>builder()
            .content(content)
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }

    private PostSummaryDto toSummaryDto(Post post, String currentUsername, Long currentUserId) {
        boolean bookmarked = currentUserId != null &&
            bookmarkRepository.existsByUserIdAndPostId(currentUserId, post.getId());

        String currentReaction = null;
        if (currentUserId != null) {
            currentReaction = reactionRepository.findByUserIdAndPostId(currentUserId, post.getId())
                .map(r -> r.getType().name())
                .orElse(null);
        }

        return PostSummaryDto.builder()
            .id(post.getId())
            .title(post.getTitle())
            .slug(post.getSlug())
            .excerpt(post.getExcerpt())
            .coverImageUrl(post.getCoverImageUrl())
            .author(toUserSummary(post.getAuthor(), currentUsername))
            .category(post.getCategory() != null ? post.getCategory().getName() : null)
            .tags(post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
            .likesCount(post.getLikesCount())
            .commentsCount(post.getCommentsCount())
            .readTime(post.getReadTime())
            .viewCount(post.getViewCount())
            .reactionsCount(post.getReactionsCount())
            .bookmarkedByCurrentUser(bookmarked)
            .status(post.getStatus())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .likedByCurrentUser(currentUserId != null && post.getLikedByUserIds().contains(currentUserId))
            .currentUserReaction(currentReaction)
            .build();
    }
}
