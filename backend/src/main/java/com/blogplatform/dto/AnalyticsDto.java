package com.blogplatform.dto;
import lombok.*;
import java.util.List;
import java.util.Map;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AnalyticsDto {
    public long totalViews;
    public int totalReactions;
    public int totalComments;
    public int totalPosts;
    public int totalFollowers;
    public List<PostAnalyticsDto> postAnalytics;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PostAnalyticsDto {
        public Long postId;
        public String title;
        public long viewCount;
        public int reactionsCount;
        public int commentsCount;
        public int readTime;
        public String status;
    }
}
