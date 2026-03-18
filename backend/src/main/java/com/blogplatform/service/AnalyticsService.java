package com.blogplatform.service;

import com.blogplatform.dto.AnalyticsDto;
import com.blogplatform.exception.ResourceNotFoundException;
import com.blogplatform.model.*;
import com.blogplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;

    public AnalyticsDto getDashboard(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        List<Post> posts = user.getPosts();

        long totalViews = posts.stream().mapToLong(Post::getViewCount).sum();
        int totalReactions = posts.stream().mapToInt(Post::getReactionsCount).sum();
        int totalComments = posts.stream().mapToInt(Post::getCommentsCount).sum();

        List<AnalyticsDto.PostAnalyticsDto> postAnalytics = posts.stream()
            .map(p -> AnalyticsDto.PostAnalyticsDto.builder()
                .postId(p.getId())
                .title(p.getTitle())
                .viewCount(p.getViewCount())
                .reactionsCount(p.getReactionsCount())
                .commentsCount(p.getCommentsCount())
                .readTime(p.getReadTime())
                .status(p.getStatus().name())
                .build())
            .collect(Collectors.toList());

        return AnalyticsDto.builder()
            .totalViews(totalViews)
            .totalReactions(totalReactions)
            .totalComments(totalComments)
            .totalPosts(posts.size())
            .totalFollowers(user.getFollowersCount())
            .postAnalytics(postAnalytics)
            .build();
    }
}
