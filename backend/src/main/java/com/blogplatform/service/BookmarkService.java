package com.blogplatform.service;

import com.blogplatform.dto.*;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggleBookmark(Long postId, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        var existing = bookmarkRepository.findByUserIdAndPostId(user.getId(), postId);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return false;
        } else {
            bookmarkRepository.save(Bookmark.builder().user(user).post(post).build());
            return true;
        }
    }

    public boolean isBookmarked(Long postId, String username) {
        if (username == null) return false;
        return userRepository.findByUsername(username)
            .map(u -> bookmarkRepository.existsByUserIdAndPostId(u.getId(), postId))
            .orElse(false);
    }

    public PagedResponse<PostSummaryDto> getBookmarkedPosts(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Pageable pageable = PageRequest.of(page, size);
        Page<Bookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        List<PostSummaryDto> posts = bookmarks.getContent().stream()
            .map(b -> toSummaryDto(b.getPost(), username, user.getId()))
            .collect(Collectors.toList());

        return PagedResponse.<PostSummaryDto>builder()
            .content(posts)
            .page(bookmarks.getNumber())
            .size(bookmarks.getSize())
            .totalElements(bookmarks.getTotalElements())
            .totalPages(bookmarks.getTotalPages())
            .last(bookmarks.isLast())
            .build();
    }

    private PostSummaryDto toSummaryDto(Post post, String username, Long userId) {
        return PostSummaryDto.builder()
            .id(post.getId())
            .title(post.getTitle())
            .slug(post.getSlug())
            .excerpt(post.getExcerpt())
            .coverImageUrl(post.getCoverImageUrl())
            .author(UserSummaryDto.builder()
                .id(post.getAuthor().getId())
                .username(post.getAuthor().getUsername())
                .avatarUrl(post.getAuthor().getAvatarUrl())
                .bio(post.getAuthor().getBio())
                .followersCount(post.getAuthor().getFollowersCount())
                .build())
            .category(post.getCategory() != null ? post.getCategory().getName() : null)
            .tags(post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
            .likesCount(post.getLikesCount())
            .commentsCount(post.getCommentsCount())
            .readTime(post.getReadTime())
            .viewCount(post.getViewCount())
            .reactionsCount(post.getReactionsCount())
            .bookmarkedByCurrentUser(true) // it's in bookmarks list
            .status(post.getStatus())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .likedByCurrentUser(post.getLikedByUserIds().contains(userId))
            .build();
    }
}
