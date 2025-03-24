package edu.cit.citforums.service;

import edu.cit.citforums.dto.CommentDto;
import edu.cit.citforums.dto.MemberSummaryDto;
import edu.cit.citforums.dto.PagedResponseDto;
import edu.cit.citforums.dto.request.CommentRequest;
import edu.cit.citforums.models.Comment;
import edu.cit.citforums.models.Member;
import edu.cit.citforums.models.Post;
import edu.cit.citforums.repository.CommentRepository;
import edu.cit.citforums.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

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
    public CommentDto createComment(CommentRequest commentRequest, Long authorId) {
        // Get the post
        Post post = postRepository.findById(commentRequest.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + commentRequest.getPostId()));
        
        // Get the author
        Member author = memberService.getMemberEntity(authorId);
        
        // Create the comment
        Comment comment = new Comment();
        comment.setContent(commentRequest.getContent());
        comment.setParentPost(post);
        comment.setAuthor(author);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        // Save and return
        Comment savedComment = commentRepository.save(comment);
        return mapToDto(savedComment);
    }

    @Override
    public CommentDto updateComment(Long commentId, CommentRequest commentRequest) {
        Comment comment = getCommentEntity(commentId);
        
        // Update fields
        comment.setContent(commentRequest.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        
        // Save and return
        Comment updatedComment = commentRepository.save(comment);
        return mapToDto(updatedComment);
    }

    @Override
    public void deleteComment(Long commentId) {
        Comment comment = getCommentEntity(commentId);
        commentRepository.delete(comment);
    }

    @Override
    public CommentDto getComment(Long commentId) {
        Comment comment = getCommentEntity(commentId);
        return mapToDto(comment);
    }

    @Override
    public List<CommentDto> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        List<Comment> comments = commentRepository.findByParentPostOrderByCreatedAt(post);
        return comments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PagedResponseDto<CommentDto> getCommentsByPostPaged(Long postId, int page, int size) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByParentPostOrderByCreatedAt(post, pageable);
        
        List<CommentDto> comments = commentPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                comments,
                commentPage.getNumber(),
                commentPage.getSize(),
                commentPage.getTotalElements(),
                commentPage.getTotalPages(),
                commentPage.isLast()
        );
    }

    @Override
    public PagedResponseDto<CommentDto> getCommentsByAuthor(Long authorId, int page, int size) {
        Member author = memberService.getMemberEntity(authorId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByAuthorOrderByCreatedAtDesc(author, pageable);
        
        List<CommentDto> comments = commentPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        
        return new PagedResponseDto<>(
                comments,
                commentPage.getNumber(),
                commentPage.getSize(),
                commentPage.getTotalElements(),
                commentPage.getTotalPages(),
                commentPage.isLast()
        );
    }

    @Override
    public Comment getCommentEntity(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));
    }
    
    // Helper method to map Comment entity to CommentDto
    private CommentDto mapToDto(Comment comment) {
        MemberSummaryDto authorDto = MemberSummaryDto.builder()
                .id(comment.getAuthor().getId())
                .name(comment.getAuthor().getName())
                .build();
                
        return CommentDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(authorDto)
                .parentPostId(comment.getParentPost().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .edited(comment.isEdited())
                .build();
    }
} 