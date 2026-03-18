package com.blogplatform.repository;

import com.blogplatform.model.PostVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostVersionRepository extends JpaRepository<PostVersion, Long> {
    List<PostVersion> findByPostIdOrderByCreatedAtDesc(Long postId);
}
