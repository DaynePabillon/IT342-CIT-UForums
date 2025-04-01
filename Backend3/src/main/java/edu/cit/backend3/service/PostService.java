package edu.cit.backend3.service;

import edu.cit.backend3.dto.PostDto;
import edu.cit.backend3.dto.request.PostRequest;
import edu.cit.backend3.models.Post;
import org.springframework.data.domain.Page;

public interface PostService {
    PostDto createPost(PostRequest postRequest, Long threadId, Long authorId);
    PostDto updatePost(Long postId, PostRequest postRequest);
    void deletePost(Long postId);
    PostDto getPost(Long postId);
    Page<PostDto> getPostsByThread(Long threadId, int page, int size);
    Page<PostDto> searchPosts(String query, int page, int size);
    Post getPostEntity(Long postId);
    boolean isPostActive(Long postId);
    PostDto togglePostStatus(Long postId);
} 