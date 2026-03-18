package com.blogplatform.repository;

import com.blogplatform.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Optional<Post> findBySlug(String slug);
    Page<Post> findByStatus(Post.PostStatus status, Pageable pageable);
    Page<Post> findByAuthorIdAndStatus(Long authorId, Post.PostStatus status, Pageable pageable);
    Page<Post> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE t.slug = :tagSlug AND p.status = 'PUBLISHED'")
    Page<Post> findByTagSlug(@Param("tagSlug") String tagSlug, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.category.slug = :categorySlug AND p.status = 'PUBLISHED'")
    Page<Post> findByCategorySlug(@Param("categorySlug") String categorySlug, Pageable pageable);

    // Trending: most viewed published posts
    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' ORDER BY p.viewCount DESC")
    Page<Post> findTrendingPosts(Pageable pageable);

    // Trending within date range
    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.publishedAt >= :since ORDER BY p.viewCount DESC")
    Page<Post> findTrendingPostsSince(@Param("since") LocalDateTime since, Pageable pageable);

    // Posts by followed authors
    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.author.id IN :authorIds ORDER BY p.publishedAt DESC")
    Page<Post> findByAuthorIdIn(@Param("authorIds") List<Long> authorIds, Pageable pageable);

    // Advanced search with filters
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN p.tags t LEFT JOIN p.category c WHERE p.status = 'PUBLISHED' " +
           "AND (:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:author IS NULL OR LOWER(p.author.username) = LOWER(:author)) " +
           "AND (:tag IS NULL OR LOWER(t.name) = LOWER(:tag)) " +
           "AND (:category IS NULL OR LOWER(c.name) = LOWER(:category)) " +
           "AND (:from IS NULL OR p.publishedAt >= :from) " +
           "AND (:to IS NULL OR p.publishedAt <= :to)")
    Page<Post> advancedSearch(@Param("query") String query,
                              @Param("author") String author,
                              @Param("tag") String tag,
                              @Param("category") String category,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to,
                              Pageable pageable);

    // Recommended: posts with same tags/category
    @Query("SELECT DISTINCT p FROM Post p JOIN p.tags t WHERE p.status = 'PUBLISHED' AND p.id <> :postId AND t.name IN :tagNames ORDER BY p.viewCount DESC")
    Page<Post> findRecommendedByTags(@Param("postId") Long postId, @Param("tagNames") List<String> tagNames, Pageable pageable);

    // Posts by list of IDs
    List<Post> findByIdIn(List<Long> ids);
}
