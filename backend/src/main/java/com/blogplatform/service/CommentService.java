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
@SuppressWarnings("null")
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<CommentDto> getCommentsByPost(Long postId) {
        // return top-level comments with nested replies
        return commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(postId).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long postId, CreateCommentRequest request, String username) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        User author = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Comment.CommentBuilder builder = Comment.builder()
            .content(request.content)
            .post(post)
            .author(author);

        // Handle nested comments
        if (request.parentCommentId != null) {
            Comment parent = commentRepository.findById(request.parentCommentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.parentCommentId));
            builder.parentComment(parent);
        }

        return toDto(commentRepository.save(builder.build()));
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
        List<CommentDto> replies = comment.getReplies() != null
            ? comment.getReplies().stream().map(this::toDto).collect(Collectors.toList())
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
}
