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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostServiceImpl.class);
    private final PostRepository postRepository;
    private final ThreadService threadService;
    private final MemberService memberService;
    private final CommentService commentService;

    @Autowired
    public PostServiceImpl(
            PostRepository postRepository,
            ThreadService threadService,
            MemberService memberService,
            CommentService commentService) {
        this.postRepository = postRepository;
        this.threadService = threadService;
        this.memberService = memberService;
        this.commentService = commentService;
    }

    @Override
    @Transactional
    public PostDto createPost(PostRequest postRequest, Long threadId, Long authorId) {
        logger.info("Creating post with request: {}", postRequest);
        
        Thread thread = threadService.getThreadEntity(threadId);
        Member author = memberService.getMemberEntity(authorId);
        
        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setThread(thread);
        post.setCreatedBy(author);
        post.setActive(true);
        
        Post savedPost = postRepository.save(post);
        logger.info("Post saved successfully with ID: {}", savedPost.getId());
        
        return mapToDto(savedPost);
    }

    @Override
    @Transactional
    public PostDto updatePost(Long postId, PostRequest postRequest) {
        Post post = getPostEntity(postId);
        
        post.setContent(postRequest.getContent());
        post.setUpdatedAt(LocalDateTime.now());
        post.setEdited(true);
        
        return mapToDto(postRepository.save(post));
    }

    @Override
    @Transactional
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
    public Page<PostDto> getPostsByThread(Long threadId, int page, int size) {
        logger.info("Fetching posts for thread ID: {} - page: {}, size: {}", threadId, page, size);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<Post> postPage = postRepository.findByThreadId(threadId, pageRequest);
        
        logger.info("Found {} posts out of {} total", postPage.getContent().size(), postPage.getTotalElements());
        
        return postPage.map(this::mapToDto);
    }

    @Override
    public Page<PostDto> searchPosts(String query, int page, int size) {
        logger.info("Searching posts with query: '{}' - page: {}, size: {}", query, page, size);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postPage = postRepository.searchPosts(query, pageRequest);
        
        logger.info("Found {} posts matching query out of {} total", postPage.getContent().size(), postPage.getTotalElements());
        
        return postPage.map(this::mapToDto);
    }

    @Override
    public Post getPostEntity(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
    }

    @Override
    public boolean isPostActive(Long postId) {
        Post post = getPostEntity(postId);
        return post.isActive();
    }
    
    // Helper method to map Post entity to PostDto
    private PostDto mapToDto(Post post) {
        MemberSummaryDto creatorDto = null;
        if (post.getCreatedBy() != null) {
            creatorDto = MemberSummaryDto.builder()
                    .id(post.getCreatedBy().getId())
                    .name(post.getCreatedBy().getName())
                    .build();
        }
        
        Thread thread = post.getThread();
        return PostDto.builder()
                .id(post.getId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .threadId(thread.getId())
                .threadTitle(thread.getTitle())
                .createdBy(creatorDto)
                .active(post.isActive())
                .edited(post.isEdited())
                .comments(Collections.emptyList())
                .build();
    }
} 