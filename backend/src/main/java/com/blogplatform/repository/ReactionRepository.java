package com.blogplatform.repository;

import com.blogplatform.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByUserIdAndPostId(Long userId, Long postId);
    List<Reaction> findByPostId(Long postId);
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    void deleteByUserIdAndPostId(Long userId, Long postId);
    long countByPostId(Long postId);

    @Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.post.id = :postId GROUP BY r.type")
    List<Object[]> countByPostIdGroupByType(@Param("postId") Long postId);
}
