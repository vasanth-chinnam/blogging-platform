package com.blogplatform.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TagDto {
    public Long id;
    public String name;
    public String slug;
    public long postCount;
}
