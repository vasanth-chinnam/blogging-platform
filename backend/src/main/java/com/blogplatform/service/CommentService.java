package com.blogplatform.service;

import com.blogplatform.dto.*;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<CommentDto> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long postId, CreateCommentRequest request, String username) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User author = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Comment comment = Comment.builder()
            .content(request.content)
            .post(post)
            .author(author)
            .build();

        return toDto(commentRepository.save(comment));
    }

    @Transactional
    public CommentDto updateComment(Long commentId, CreateCommentRequest request, String username) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to update this comment");
        }

        comment.setContent(request.content);
        return toDto(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long commentId, String username, boolean isAdmin) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!isAdmin && !comment.getAuthor().getUsername().equals(username)) {
            throw new AccessDeniedException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentDto toDto(Comment comment) {
        return CommentDto.builder()
            .id(comment.getId())
            .content(comment.getContent())
            .author(UserSummaryDto.builder()
                .id(comment.getAuthor().getId())
                .username(comment.getAuthor().getUsername())
                .avatarUrl(comment.getAuthor().getAvatarUrl())
                .build())
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .build();
    }
}
