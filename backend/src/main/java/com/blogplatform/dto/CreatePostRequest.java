package com.blogplatform.dto;
import com.blogplatform.model.Post;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.Set;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePostRequest {
    @NotBlank public String title;
    @NotBlank public String content;
    public String excerpt;
    public String coverImageUrl;
    public Set<String> tags;
    public String category;
    public Post.PostStatus status;
}
