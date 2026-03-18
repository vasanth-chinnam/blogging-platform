package com.blogplatform.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ReactionRequest {
    public String type; // FIRE, HEART, CLAP, CELEBRATE, INSIGHTFUL
}
