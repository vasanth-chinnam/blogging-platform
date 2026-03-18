package com.blogplatform.dto;
import lombok.*;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AiSuggestionDto {
    public List<String> titles;
    public String summary;
    public List<String> tags;
    public String improvedContent;
}
