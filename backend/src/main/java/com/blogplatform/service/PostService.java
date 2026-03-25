package com.blogplatform.service;

import com.blogplatform.dto.*;
import com.blogplatform.exception.*;
import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;
    private final ReactionRepository reactionRepository;
    private final BookmarkRepository bookmarkRepository;
    private final PostVersionRepository postVersionRepository;

    public PagedResponse<PostSummaryDto> getAllPublishedPosts(int page, int size, String sortBy, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<Post> posts = postRepository.findByStatus(Post.PostStatus.PUBLISHED, pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PagedResponse<PostSummaryDto> searchPosts(String query, int page, int size, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.searchPosts(query, pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PagedResponse<PostSummaryDto> advancedSearch(String query, String author, String tag, String category,
                                                          LocalDateTime from, LocalDateTime to,
                                                          int page, int size, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Post> posts = postRepository.advancedSearch(query, author, tag, category, from, to, pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PagedResponse<PostSummaryDto> getTrendingPosts(int page, int size, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findTrendingPosts(pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PagedResponse<PostSummaryDto> getRecommendedPosts(Long postId, int size, String currentUsername) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        List<String> tagNames = post.getTags().stream().map(Tag::getName).collect(Collectors.toList());
        if (tagNames.isEmpty()) {
            tagNames = List.of("__none__");
        }
        Pageable pageable = PageRequest.of(0, size);
        Page<Post> posts = postRepository.findRecommendedByTags(postId, tagNames, pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PagedResponse<PostSummaryDto> getPostsByTag(String tagSlug, int page, int size, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByTagSlug(tagSlug, pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PagedResponse<PostSummaryDto> getPostsByCategory(String categorySlug, int page, int size, String currentUsername) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByCategorySlug(categorySlug, pageable);
        return toPagedResponse(posts, currentUsername);
    }

    public PostDetailDto getPostBySlug(String slug, String currentUsername) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "slug", slug));
        return toDetailDto(post, currentUsername);
    }

    @Transactional
    public PostDetailDto getPostById(Long id, String currentUsername) {
        try {
            Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
            // Increment view count
            post.setViewCount(post.getViewCount() + 1);
            postRepository.save(post);
            return toDetailDto(post, currentUsername);
        } catch (Exception e) {
            System.err.println("Error in getPostById: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public PagedResponse<PostSummaryDto> getMyPosts(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> posts = postRepository.findByAuthorId(user.getId(), pageable);
        return toPagedResponse(posts, username);
    }

    @Transactional
    public PostDetailDto createPost(CreatePostRequest request, String username) {
        User author = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Post post = Post.builder()
            .title(request.title)
            .content(request.content)
            .excerpt(request.excerpt != null ? request.excerpt : generateExcerpt(request.content))
            .coverImageUrl(request.coverImageUrl)
            .author(author)
            .status(request.status != null ? request.status : Post.PostStatus.DRAFT)
            .readTime(calculateReadTime(request.content))
            .build();

        post.setSlug(generateSlug(request.title));

        if (request.tags != null) {
            post.setTags(resolveTags(request.tags));
        }

        if (request.category != null) {
            post.setCategory(resolveCategory(request.category));
        }

        Post savedPost = postRepository.save(post);
        saveVersion(savedPost);
        return toDetailDto(savedPost, username);
    }

    @Transactional
    public PostDetailDto updatePost(Long id, UpdatePostRequest request, String username) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to update this post");
        }

        if (request.title != null) {
            post.setTitle(request.title);
            post.setSlug(generateSlug(request.title));
        }
        if (request.content != null) {
            post.setContent(request.content);
            post.setReadTime(calculateReadTime(request.content));
        }
        if (request.excerpt != null) post.setExcerpt(request.excerpt);
        if (request.coverImageUrl != null) post.setCoverImageUrl(request.coverImageUrl);
        if (request.tags != null) post.setTags(resolveTags(request.tags));
        if (request.category != null) post.setCategory(resolveCategory(request.category));
        if (request.status != null) {
            if (request.status == Post.PostStatus.PUBLISHED && post.getPublishedAt() == null) {
                post.setPublishedAt(LocalDateTime.now());
            }
            post.setStatus(request.status);
        }

        Post savedPost = postRepository.save(post);
        saveVersion(savedPost);
        return toDetailDto(savedPost, username);
    }

    @Transactional
    public void autoSave(Long id, String content, String username) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to edit this post");
        }
        post.setAutoSavedContent(content);
        postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id, String username, boolean isAdmin) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));

        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to delete this post");
        }

        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleLike(Long postId, String username) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean liked;
        if (post.getLikedByUserIds().contains(user.getId())) {
            post.getLikedByUserIds().remove(user.getId());
            liked = false;
        } else {
            post.getLikedByUserIds().add(user.getId());
            liked = true;
        }
        postRepository.save(post);
        return liked;
    }

    @Transactional
    public Map<String, Object> toggleReaction(Long postId, String reactionType, String username) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Reaction.ReactionType type = Reaction.ReactionType.valueOf(reactionType.toUpperCase());

        Optional<Reaction> existing = reactionRepository.findByUserIdAndPostId(user.getId(), postId);
        boolean added;
        if (existing.isPresent()) {
            if (existing.get().getType() == type) {
                // Remove reaction if same type clicked again
                reactionRepository.delete(existing.get());
                added = false;
            } else {
                // Change reaction type
                existing.get().setType(type);
                reactionRepository.save(existing.get());
                added = true;
            }
        } else {
            reactionRepository.save(Reaction.builder().user(user).post(post).type(type).build());
            added = true;
        }

        // Get updated breakdown
        Map<String, Integer> breakdown = getReactionBreakdown(postId);
        Map<String, Object> result = new HashMap<>();
        result.put("added", added);
        result.put("type", added ? type.name() : null);
        result.put("breakdown", breakdown);
        result.put("total", breakdown.values().stream().mapToInt(Integer::intValue).sum());
        return result;
    }

    public List<PostVersionDto> getPostVersions(Long postId, String username) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        if (!post.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to view history");
        }
        return postVersionRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
            .map(v -> PostVersionDto.builder()
                .id(v.getId())
                .content(v.getContent())
                .createdAt(v.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }

    private void saveVersion(Post post) {
        PostVersion version = PostVersion.builder()
            .post(post)
            .content(post.getContent())
            .build();
        postVersionRepository.save(version);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Map<String, Integer> getReactionBreakdown(Long postId) {
        Map<String, Integer> breakdown = new LinkedHashMap<>();
        try {
            List<Object[]> results = reactionRepository.countByPostIdGroupByType(postId);
            for (Object[] row : results) {
                if (row == null || row.length < 2) continue;
                Object typeObj = row[0];
                String typeName = typeObj instanceof Reaction.ReactionType 
                    ? ((Reaction.ReactionType) typeObj).name() 
                    : String.valueOf(typeObj);
                breakdown.put(typeName, ((Long) row[1]).intValue());
            }
        } catch (Exception e) {
            System.err.println("Error in getReactionBreakdown for post " + postId + ": " + e.getMessage());
        }
        return breakdown;
    }

    private Set<Tag> resolveTags(Set<String> tagNames) {
        return tagNames.stream().map(name -> {
            String slug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-");
            return tagRepository.findByName(name).orElseGet(() ->
                tagRepository.save(Tag.builder().name(name).slug(slug).build()));
        }).collect(Collectors.toSet());
    }

    private Category resolveCategory(String categoryName) {
        String slug = categoryName.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        return categoryRepository.findByName(categoryName).orElseGet(() ->
            categoryRepository.save(Category.builder().name(categoryName).slug(slug).build()));
    }

    private String generateSlug(String title) {
        String base = title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        String slug = base;
        int counter = 1;
        while (postRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private String generateExcerpt(String content) {
        String plain = content.replaceAll("<[^>]+>", "").replaceAll("#+\\s", "").trim();
        return plain.length() > 200 ? plain.substring(0, 200) + "..." : plain;
    }

    private int calculateReadTime(String content) {
        int wordCount = content.split("\\s+").length;
        return Math.max(1, wordCount / 200);
    }

    private UserSummaryDto toUserSummary(User user, String currentUsername) {
        boolean followed = false;
        if (currentUsername != null && !currentUsername.equals(user.getUsername())) {
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

    private PostSummaryDto toSummaryDto(Post post, String currentUsername) {
        Long currentUserId = currentUsername != null
            ? userRepository.findByUsername(currentUsername).map(User::getId).orElse(null)
            : null;

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
            .reactionBreakdown(getReactionBreakdown(post.getId()))
            .bookmarkedByCurrentUser(bookmarked)
            .status(post.getStatus())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .likedByCurrentUser(currentUserId != null && post.getLikedByUserIds().contains(currentUserId))
            .currentUserReaction(currentReaction)
            .build();
    }

    private PostDetailDto toDetailDto(Post post, String currentUsername) {
        Long currentUserId = currentUsername != null
            ? userRepository.findByUsername(currentUsername).map(User::getId).orElse(null)
            : null;

        boolean bookmarked = currentUserId != null &&
            bookmarkRepository.existsByUserIdAndPostId(currentUserId, post.getId());

        String currentReaction = null;
        if (currentUserId != null) {
            currentReaction = reactionRepository.findByUserIdAndPostId(currentUserId, post.getId())
                .map(r -> r.getType().name())
                .orElse(null);
        }

        List<CommentDto> comments = post.getComments().stream()
            .filter(c -> c.getParentComment() == null) // top-level only
            .map(this::toCommentDto)
            .collect(Collectors.toList());

        return PostDetailDto.builder()
            .id(post.getId())
            .title(post.getTitle())
            .slug(post.getSlug())
            .content(post.getContent())
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
            .reactionBreakdown(getReactionBreakdown(post.getId()))
            .bookmarkedByCurrentUser(bookmarked)
            .status(post.getStatus())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .likedByCurrentUser(currentUserId != null && post.getLikedByUserIds().contains(currentUserId))
            .currentUserReaction(currentReaction)
            .comments(comments)
            .build();
    }

    private CommentDto toCommentDto(Comment comment) {
        List<CommentDto> replies = comment.getReplies() != null
            ? comment.getReplies().stream().map(this::toCommentDto).collect(Collectors.toList())
            : List.of();

        return CommentDto.builder()
            .id(comment.getId())
            .content(comment.getContent())
            .author(UserSummaryDto.builder()
                .id(comment.getAuthor().getId())
                .username(comment.getAuthor().getUsername())
                .avatarUrl(comment.getAuthor().getAvatarUrl())
                .build())
            .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
            .replies(replies)
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .build();
    }

    private PagedResponse<PostSummaryDto> toPagedResponse(Page<Post> page, String currentUsername) {
        List<PostSummaryDto> content = page.getContent().stream()
            .map(p -> toSummaryDto(p, currentUsername))
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
}
