package com.blogplatform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostVersionDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
}
