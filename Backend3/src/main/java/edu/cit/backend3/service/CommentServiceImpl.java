package edu.cit.backend3.service;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.MemberSummaryDto;
import edu.cit.backend3.dto.request.CommentRequest;
import edu.cit.backend3.models.Comment;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.models.Post;
import edu.cit.backend3.models.Thread;
import edu.cit.backend3.repository.CommentRepository;
import edu.cit.backend3.repository.PostRepository;
import edu.cit.backend3.repository.ThreadRepository;
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
    private final ThreadRepository threadRepository;
    private final MemberService memberService;

    @Autowired
    public CommentServiceImpl(
            CommentRepository commentRepository,
            PostRepository postRepository,
            ThreadRepository threadRepository,
            MemberService memberService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.threadRepository = threadRepository;
        this.memberService = memberService;
    }

    @Override
    @Transactional
    public CommentDto createComment(CommentRequest commentRequest, Long postId, Long threadId, Long authorId) {
        logger.info("Creating comment for post ID: {} with content length: {}", postId, commentRequest.getContent().length());
        
        // Use threadId from the request if available, otherwise use the one from the path parameter
        Long effectiveThreadId = commentRequest.getThreadId() != null ? commentRequest.getThreadId() : threadId;
        logger.info("Using thread ID: {} for comment creation", effectiveThreadId);
        
        // First try to find the post directly
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        Thread thread = null;
        
        // If threadId is provided, try to find that thread
        if (effectiveThreadId != null) {
            thread = threadRepository.findById(effectiveThreadId)
                    .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + effectiveThreadId));
            
            // Check if post belongs to the specified thread
            if (!post.getThread().getId().equals(effectiveThreadId)) {
                logger.warn("Post {} does not belong to thread {}. Using thread from post instead.", postId, effectiveThreadId);
                // Instead of throwing an exception, use the thread that the post actually belongs to
                thread = post.getThread();
                logger.info("Using thread {} from post instead of requested thread {}", thread.getId(), effectiveThreadId);
            } else {
                logger.info("Verified post {} belongs to thread {}", postId, effectiveThreadId);
            }
        } else {
            // If no threadId provided, use the thread from the post
            thread = post.getThread();
            logger.info("No thread ID provided, using thread {} from post", thread.getId());
        }
        
        logger.info("Found post with ID: {} for thread: {}", post.getId(), thread.getId());
        
        Member author = memberService.getMemberEntity(authorId);
        
        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setParentPost(post);
        comment.setAuthor(author);
        
        // Set the thread reference directly to ensure comments are properly associated with threads
        comment.setThread(thread);
        
        Comment savedComment = commentRepository.save(comment);
        logger.info("Comment saved successfully with ID: {} for thread ID: {}", 
                    savedComment.getId(), savedComment.getThread().getId());
        
        // Update the thread's comment count
        thread.setCommentCount(thread.getCommentCount() + 1);
        threadRepository.save(thread);
        logger.info("Updated thread {} comment count to {}", thread.getId(), thread.getCommentCount());
        
        return mapToDto(savedComment);
    }
    
    @Override
    @Transactional
    public CommentDto createCommentOnThread(CommentRequest commentRequest, Long threadId, Long authorId) {
        logger.info("Creating comment directly on thread ID: {} with content length: {}", 
                  threadId, commentRequest.getContent().length());
        
        // Use threadId from the request if available, otherwise use the one from the path parameter
        Long effectiveThreadId = commentRequest.getThreadId() != null ? commentRequest.getThreadId() : threadId;
        logger.info("Using thread ID: {} for direct thread comment creation", effectiveThreadId);
        
        // Find the thread
        Thread thread = threadRepository.findById(effectiveThreadId)
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + effectiveThreadId));
        
        // Find the first post in the thread to associate the comment with
        Page<Post> posts = postRepository.findByThreadId(effectiveThreadId, 
                PageRequest.of(0, 1, Sort.by("createdAt").ascending()));
        
        if (posts.isEmpty()) {
            logger.error("No posts found for thread ID: {}", effectiveThreadId);
            throw new RuntimeException("No posts found for thread ID: " + effectiveThreadId);
        }
        
        Post firstPost = posts.getContent().get(0);
        logger.info("Using first post ID: {} for thread: {}", firstPost.getId(), effectiveThreadId);
        
        Member author = memberService.getMemberEntity(authorId);
        
        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setParentPost(firstPost); // Associate with the first post
        comment.setAuthor(author);
        comment.setThread(thread); // Set the thread reference directly
        
        Comment savedComment = commentRepository.save(comment);
        logger.info("Comment saved successfully with ID: {} for thread ID: {}", 
                    savedComment.getId(), savedComment.getThread().getId());
        
        // Update the thread's comment count
        thread.setCommentCount(thread.getCommentCount() + 1);
        threadRepository.save(thread);
        logger.info("Updated thread {} comment count to {}", thread.getId(), thread.getCommentCount());
        
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
        
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        
        // Try to find comments directly by thread ID first
        try {
            // Find the thread
            Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found with ID: " + threadId));
            
            // Find comments by thread reference
            Page<Comment> commentsByThread = commentRepository.findByThread(thread, pageRequest);
            
            if (commentsByThread.hasContent()) {
                logger.info("Found {} comments by thread reference out of {} total", 
                    commentsByThread.getContent().size(), commentsByThread.getTotalElements());
                return commentsByThread.map(this::mapToDto);
            }
        } catch (Exception e) {
            logger.warn("Error finding comments by thread reference: {}", e.getMessage());
        }
        
        // Fallback: Get comments through the first post of the thread
        try {
            Page<Post> posts = postRepository.findByThreadId(threadId, PageRequest.of(0, 1));
            
            // If no posts found, return an empty page
            if (posts.isEmpty()) {
                logger.warn("No posts found for thread ID: {}", threadId);
                return Page.empty(pageRequest);
            }
            
            Post firstPost = posts.getContent().get(0);
            Page<Comment> comments = commentRepository.findByParentPost(firstPost, pageRequest);
            
            logger.info("Found {} comments by post reference out of {} total", 
                comments.getContent().size(), comments.getTotalElements());
            
            return comments.map(this::mapToDto);
        } catch (Exception e) {
            logger.error("Error finding comments by post reference: {}", e.getMessage());
            return Page.empty(pageRequest);
        }
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