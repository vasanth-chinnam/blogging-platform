package com.blogplatform.dto;
import com.blogplatform.model.Post;
import lombok.*;
import java.util.Set;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdatePostRequest {
    public String title;
    public String content;
    public String excerpt;
    public String coverImageUrl;
    public Set<String> tags;
    public String category;
    public Post.PostStatus status;
}
