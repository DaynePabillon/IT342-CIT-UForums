package edu.cit.citforums.service;

import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.PostDto;
import edu.cit.citforums.dto.request.PostRequest;
import edu.cit.citforums.models.Post;

import java.util.List;

public interface PostService {
    
    PostDto createPost(PostRequest postRequest, Long authorId);
    
    PostDto updatePost(Long postId, PostRequest postRequest);
    
    void deletePost(Long postId);
    
    PostDto getPost(Long postId);
    
    PagedResponseDto<PostDto> getPostsByThread(Long threadId, int page, int size);
    
    List<PostDto> getAllPostsByThread(Long threadId);
    
    PagedResponseDto<PostDto> getPostsByAuthor(Long authorId, int page, int size);
    
    PagedResponseDto<PostDto> searchPosts(String query, int page, int size);
    
    Post getPostEntity(Long postId);
    
    long countPostsByThread(Long threadId);
} 