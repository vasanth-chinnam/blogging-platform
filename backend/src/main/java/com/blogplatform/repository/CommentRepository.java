package com.blogplatform.repository;

import com.blogplatform.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);
    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(Long postId);
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);
    long countByPostId(Long postId);
}
