package com.blogplatform.dto;
import com.blogplatform.model.Post;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PostDetailDto {
    public Long id;
    public String title;
    public String slug;
    public String content;
    public String excerpt;
    public String coverImageUrl;
    public UserSummaryDto author;
    public String category;
    public Set<String> tags;
    public int likesCount;
    public int commentsCount;
    public int readTime;
    public Post.PostStatus status;
    public LocalDateTime publishedAt;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public boolean likedByCurrentUser;
    public List<CommentDto> comments;
}
