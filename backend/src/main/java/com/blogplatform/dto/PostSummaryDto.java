package com.blogplatform.dto;
import com.blogplatform.model.Post;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PostSummaryDto {
    public Long id;
    public String title;
    public String slug;
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
    public boolean likedByCurrentUser;
}
