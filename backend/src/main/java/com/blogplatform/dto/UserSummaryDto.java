package com.blogplatform.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSummaryDto {
    public Long id;
    public String username;
    public String avatarUrl;
    public String bio;
    public int followersCount;
    public int followingCount;
    public boolean followedByCurrentUser;
}
