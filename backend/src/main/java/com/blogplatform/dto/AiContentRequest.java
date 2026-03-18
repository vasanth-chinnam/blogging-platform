package com.blogplatform.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AiContentRequest {
    public String content;
    public String title;
}
