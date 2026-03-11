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
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;

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

    public PostDetailDto getPostById(Long id, String currentUsername) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
        return toDetailDto(post, currentUsername);
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

        if (post.getStatus() == Post.PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }

        return toDetailDto(postRepository.save(post), username);
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

        return toDetailDto(postRepository.save(post), username);
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

    // ── Helpers ──────────────────────────────────────────────────────────────

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

    private UserSummaryDto toUserSummary(User user) {
        return UserSummaryDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .avatarUrl(user.getAvatarUrl())
            .bio(user.getBio())
            .build();
    }

    private PostSummaryDto toSummaryDto(Post post, String currentUsername) {
        Long currentUserId = currentUsername != null
            ? userRepository.findByUsername(currentUsername).map(User::getId).orElse(null)
            : null;

        return PostSummaryDto.builder()
            .id(post.getId())
            .title(post.getTitle())
            .slug(post.getSlug())
            .excerpt(post.getExcerpt())
            .coverImageUrl(post.getCoverImageUrl())
            .author(toUserSummary(post.getAuthor()))
            .category(post.getCategory() != null ? post.getCategory().getName() : null)
            .tags(post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
            .likesCount(post.getLikesCount())
            .commentsCount(post.getCommentsCount())
            .readTime(post.getReadTime())
            .status(post.getStatus())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .likedByCurrentUser(currentUserId != null && post.getLikedByUserIds().contains(currentUserId))
            .build();
    }

    private PostDetailDto toDetailDto(Post post, String currentUsername) {
        Long currentUserId = currentUsername != null
            ? userRepository.findByUsername(currentUsername).map(User::getId).orElse(null)
            : null;

        List<CommentDto> comments = post.getComments().stream().map(c ->
            CommentDto.builder()
                .id(c.getId())
                .content(c.getContent())
                .author(toUserSummary(c.getAuthor()))
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build()
        ).collect(Collectors.toList());

        return PostDetailDto.builder()
            .id(post.getId())
            .title(post.getTitle())
            .slug(post.getSlug())
            .content(post.getContent())
            .excerpt(post.getExcerpt())
            .coverImageUrl(post.getCoverImageUrl())
            .author(toUserSummary(post.getAuthor()))
            .category(post.getCategory() != null ? post.getCategory().getName() : null)
            .tags(post.getTags().stream().map(Tag::getName).collect(Collectors.toSet()))
            .likesCount(post.getLikesCount())
            .commentsCount(post.getCommentsCount())
            .readTime(post.getReadTime())
            .status(post.getStatus())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .likedByCurrentUser(currentUserId != null && post.getLikedByUserIds().contains(currentUserId))
            .comments(comments)
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
