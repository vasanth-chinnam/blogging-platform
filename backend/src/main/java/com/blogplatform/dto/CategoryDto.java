package com.blogplatform.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryDto {
    public Long id;
    public String name;
    public String slug;
    public String description;
    public String color;
    public long postCount;
}
