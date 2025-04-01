package edu.cit.backend3.service;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.PagedResponseDto;
import edu.cit.backend3.dto.request.CommentRequest;
import edu.cit.backend3.models.Comment;

import java.util.List;

public interface CommentService {
    
    CommentDto createComment(CommentRequest commentRequest, Long authorId);
    
    CommentDto updateComment(Long commentId, CommentRequest commentRequest);
    
    void deleteComment(Long commentId);
    
    CommentDto getComment(Long commentId);
    
    List<CommentDto> getCommentsByPost(Long postId);
    
    PagedResponseDto<CommentDto> getCommentsByPostPaged(Long postId, int page, int size);
    
    PagedResponseDto<CommentDto> getCommentsByAuthor(Long authorId, int page, int size);
    
    Comment getCommentEntity(Long commentId);
} 