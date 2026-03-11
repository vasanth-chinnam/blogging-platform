package com.blogplatform.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfileDto {
    public Long id;
    public String username;
    public String email;
    public String bio;
    public String avatarUrl;
    public int postCount;
    public LocalDateTime createdAt;
}
