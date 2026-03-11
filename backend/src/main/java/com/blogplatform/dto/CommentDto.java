package com.blogplatform.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentDto {
    public Long id;
    public String content;
    public UserSummaryDto author;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
