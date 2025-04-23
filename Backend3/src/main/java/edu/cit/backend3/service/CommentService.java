package edu.cit.backend3.service;

import edu.cit.backend3.dto.CommentDto;
import edu.cit.backend3.dto.request.CommentRequest;
import edu.cit.backend3.models.Comment;
import org.springframework.data.domain.Page;

public interface CommentService {
    
    CommentDto createComment(CommentRequest commentRequest, Long postId, Long threadId, Long authorId);
    
    CommentDto createCommentOnThread(CommentRequest commentRequest, Long threadId, Long authorId);
    
    CommentDto updateComment(Long commentId, CommentRequest commentRequest);
    
    void deleteComment(Long commentId);
    
    CommentDto getComment(Long commentId);
    
    Page<CommentDto> getCommentsByThread(Long threadId, int page, int size);
    
    Page<CommentDto> getCommentsByPost(Long postId, int page, int size);
    
    Page<CommentDto> getCommentsByAuthor(Long authorId, int page, int size);
    
    Comment getCommentEntity(Long commentId);
}