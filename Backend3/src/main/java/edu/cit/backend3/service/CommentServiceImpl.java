package edu.cit.backend3.service;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.CommentRequest;
import edu.cit.backend3.models.Comment;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Post;
import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentServiceImpl implements CommentService {

    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImpl.class);
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final MemberService memberService;

    @Autowired
    public CommentServiceImpl(
            CommentRepository commentRepository,
            PostRepository postRepository,
            MemberService memberService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.memberService = memberService;
    }

    @Override
    @Transactional
    public CommentDto createComment(CommentRequest commentRequest, Long postId, Long authorId) {
        logger.info("Creating comment for post ID: {} with content length: {}", postId, commentRequest.getContent().length());
        
        // First try to find the post directly
        Post post = postRepository.findById(postId)
                .orElseGet(() -> {
                    // If post not found, try to get the first post of the thread
                    Page<Post> posts = postRepository.findByThreadId(postId, PageRequest.of(0, 1, Sort.by("createdAt").ascending()));
                    if (posts.isEmpty()) {
                        throw new RuntimeException("No posts found for thread ID: " + postId);
                    }
                    return posts.getContent().get(0);
                });
        
        Member author = memberService.getMemberEntity(authorId);
        
        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setParentPost(post);
        comment.setAuthor(author);
        
        Comment savedComment = commentRepository.save(comment);
        logger.info("Comment saved successfully with ID: {}", savedComment.getId());
        
        return mapToDto(savedComment);
    }

    @Override
    @Transactional
    public CommentDto updateComment(Long commentId, CommentRequest commentRequest) {
        Comment comment = getCommentEntity(commentId);
        
        comment.setContent(commentRequest.getContent());
        comment.setEdited(true);
        
        return mapToDto(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = getCommentEntity(commentId);
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public CommentDto getComment(Long commentId) {
        Comment comment = getCommentEntity(commentId);
        return mapToDto(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByThread(Long threadId, int page, int size) {
        logger.info("Fetching comments for thread ID: {} - page: {}, size: {}", threadId, page, size);
        
        // First get all posts for this thread with pagination
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<Post> posts = postRepository.findByThreadId(threadId, PageRequest.of(0, 1));
        
        // If no posts found, return an empty page
        if (posts.isEmpty()) {
            return Page.empty(pageRequest);
        }
        
        Post firstPost = posts.getContent().get(0);
        Page<Comment> comments = commentRepository.findByParentPost(firstPost, pageRequest);
        
        logger.info("Found {} comments out of {} total", comments.getContent().size(), comments.getTotalElements());
        
        return comments.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByPost(Long postId, int page, int size) {
        logger.info("Fetching comments for post ID: {} - page: {}, size: {}", postId, page, size);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        Page<Comment> comments = commentRepository.findByParentPost(post, pageRequest);
        
        logger.info("Found {} comments out of {} total", comments.getContent().size(), comments.getTotalElements());
        
        return comments.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDto> getCommentsByAuthor(Long authorId, int page, int size) {
        logger.info("Fetching comments for author ID: {} - page: {}, size: {}", authorId, page, size);
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Comment> comments = commentRepository.findByAuthorId(authorId, pageRequest);
        
        logger.info("Found {} comments out of {} total", comments.getContent().size(), comments.getTotalElements());
        
        return comments.map(this::mapToDto);
    }

    @Override
    public Comment getCommentEntity(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));
    }

    private CommentDto mapToDto(Comment comment) {
        MemberSummaryDto authorDto = null;
        if (comment.getAuthor() != null) {
            authorDto = MemberSummaryDto.builder()
                    .id(comment.getAuthor().getId())
                    .name(comment.getAuthor().getName())
                    .build();
        }
        
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .edited(comment.isEdited())
                .author(authorDto)
                .parentPostId(comment.getParentPost().getId())
                .build();
    }
} 