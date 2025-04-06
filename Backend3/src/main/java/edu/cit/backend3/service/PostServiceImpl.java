package edu.cit.backend3.service;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.PagedResponseDto;
import edu.cit.backend3.dto.PostDto;
import edu.cit.backend3.dto.request.PostRequest;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Post;
import edu.cit.backend3.models.Thread;
import edu.cit.backend3.repository.PostRepository;
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
        logger.info("Creating post for thread ID: {} with content length: {}", threadId, postRequest.getContent().length());
        
        Thread thread = threadService.getThreadEntity(threadId);
        Member author = memberService.getMemberEntity(authorId);
        
        Post post = new Post();
        post.setContent(postRequest.getContent());
        post.setThread(thread);
        post.setAuthor(author);
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
        
        // Get comments for this post with default pagination
        Page<CommentDto> commentPage = commentService.getCommentsByPost(postId, 0, 50);
        postDto.setComments(commentPage.getContent());
        
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

    @Override
    @Transactional
    public PostDto togglePostStatus(Long postId) {
        Post post = getPostEntity(postId);
        post.setActive(!post.isActive());
        post.setUpdatedAt(LocalDateTime.now());
        return mapToDto(postRepository.save(post));
    }
    
    // Helper method to map Post entity to PostDto
    private PostDto mapToDto(Post post) {
        MemberSummaryDto authorDto = null;
        if (post.getAuthor() != null) {
            authorDto = MemberSummaryDto.builder()
                    .id(post.getAuthor().getId())
                    .name(post.getAuthor().getName())
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
                .author(authorDto)
                .active(post.isActive())
                .edited(post.isEdited())
                .comments(Collections.emptyList())
                .build();
    }
} 