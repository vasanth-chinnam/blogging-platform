package com.blogplatform.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentDto {
    public Long id;
    public String content;
    public UserSummaryDto author;
    public Long parentCommentId;
    public List<CommentDto> replies;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
