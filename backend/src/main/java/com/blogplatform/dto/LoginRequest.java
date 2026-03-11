package com.blogplatform.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginRequest {
    @NotBlank public String usernameOrEmail;
    @NotBlank public String password;
}
