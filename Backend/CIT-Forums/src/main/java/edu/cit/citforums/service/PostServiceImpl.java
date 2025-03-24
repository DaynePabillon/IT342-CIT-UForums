package edu.cit.citforums.service;

import edu.cit.citforums.dto.CommentDto;
import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.PostDto;
import edu.cit.citforums.dto.request.PostRequest;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.models.Post;
import edu.cit.citforums.models.Thread;
import edu.cit.citforums.repository.PostRepository;
import edu.cit.citforums.repository.ThreadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final ThreadRepository threadRepository;
    private final MemberService memberService;
    private final CommentService commentService;

    @Autowired
    public PostServiceImpl(
            PostRepository postRepository,
            ThreadRepository threadRepository,
            MemberService memberService,
            CommentService commentService) {
        this.postRepository = postRepository;
        this.threadRepository = threadRepository;
        this.memberService = memberService;
        this.commentService = commentService;
    }

    @Override
    public PostDto createPost(PostRequest postRequest, Long authorId) {
        // Get the thread
        Thread thread = threadRepository.findById(postRequest.getThreadId())
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + postRequest.getThreadId()));
        
        // Get the author
        Member author = memberService.getMemberEntity(authorId);
        
        // Create post
        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setThread(thread);
        post.setAuthor(author);
        post.setCreatedAt(LocalDateTime.now());
        
        // Save and return
        Post savedPost = postRepository.save(post);
        return mapToDto(savedPost);
    }

    @Override
    public PostDto updatePost(Long postId, PostRequest postRequest) {
        Post post = getPostEntity(postId);
        
        // Update fields
        post.setContent(postRequest.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        
        // Save and return
        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost);
    }

    @Override
    public void deletePost(Long postId) {
        Post post = getPostEntity(postId);
        postRepository.delete(post);
    }

    @Override
    public PostDto getPost(Long postId) {
        Post post = getPostEntity(postId);
        PostDto postDto = mapToDto(post);
        
        // Get comments for this post
        postDto.setComments(commentService.getCommentsByPost(postId));
        
        return postDto;
    }

    @Override
    public PagedResponseDto<PostDto> getPostsByThread(Long threadId, int page, int size) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + threadId));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.findByThreadOrderByCreatedAt(thread, pageable);
        
        List<PostDto> posts = postPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                posts,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast()
        );
    }

    @Override
    public List<PostDto> getAllPostsByThread(Long threadId) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + threadId));
        
        List<Post> posts = postRepository.findByThreadOrderByCreatedAt(thread);
        return posts.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PagedResponseDto<PostDto> getPostsByAuthor(Long authorId, int page, int size) {
        Member author = memberService.getMemberEntity(authorId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.findByAuthorOrderByCreatedAtDesc(author, pageable);
        
        List<PostDto> posts = postPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                posts,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast()
        );
    }

    @Override
    public PagedResponseDto<PostDto> searchPosts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postPage = postRepository.searchPosts(query, pageable);
        
        List<PostDto> posts = postPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                posts,
                postPage.getNumber(),
                postPage.getSize(),
                postPage.getTotalElements(),
                postPage.getTotalPages(),
                postPage.isLast()
        );
    }

    @Override
    public Post getPostEntity(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
    }

    @Override
    public long countPostsByThread(Long threadId) {
        return postRepository.countByThreadId(threadId);
    }
    
    // Helper method to map Post entity to PostDto
    private PostDto mapToDto(Post post) {
        MemberSummaryDto authorDto = MemberSummaryDto.builder()
                .id(post.getAuthor().getId())
                .name(post.getAuthor().getName())
                .build();
        
        return PostDto.builder()
                .id(post.getId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .threadId(post.getThread().getId())
                .threadTitle(post.getThread().getTitle())
                .author(authorDto)
                .edited(post.isEdited())
                .comments(Collections.emptyList()) // Comments are loaded separately when needed
                .build();
    }
} 