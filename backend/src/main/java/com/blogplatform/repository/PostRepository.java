package com.blogplatform.repository;
import com.blogplatform.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
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
}
