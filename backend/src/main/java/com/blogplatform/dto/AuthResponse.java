package com.blogplatform.dto;
import lombok.*;
import java.util.Set;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    public String accessToken;
    public String tokenType = "Bearer";
    public Long userId;
    public String username;
    public String email;
    public Set<String> roles;
}
