package com.blogplatform.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateCommentRequest {
    @NotBlank @Size(min=1,max=2000) public String content;
}
