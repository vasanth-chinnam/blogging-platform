package com.blogplatform.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank @Size(min=3,max=50) public String username;
    @NotBlank @Email public String email;
    @NotBlank @Size(min=6) public String password;
}
