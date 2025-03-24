package edu.cit.citforums;

import edu.cit.citforums.repository.CommentRepository;
import edu.cit.citforums.repository.ForumRepository;
import edu.cit.citforums.repository.PostRepository;
import edu.cit.citforums.repository.ThreadRepository;
import edu.cit.citforums.service.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@SpringBootApplication
@ComponentScan(
    basePackages = {
        "edu.cit.citforums.config",
        "edu.cit.citforums.controller",
        "edu.cit.citforums.controllers",
        "edu.cit.citforums.models",
        "edu.cit.citforums.repository",
        "edu.cit.citforums.repositories",
        "edu.cit.citforums.security",
        "edu.cit.citforums.service",
        "edu.cit.citforums.services"
    }
)
public class ForumApplication {
    public static void main(String[] args) {
        SpringApplication.run(ForumApplication.class, args);
    }
    
    @Configuration
    public static class ServiceConfig {
        
        @Bean
        public ThreadService threadService(
                ThreadRepository threadRepository,
                ForumRepository forumRepository,
                MemberService memberService,
                PostService postService) {
            return new ThreadServiceImpl(threadRepository, forumRepository, memberService, postService);
        }
        
        @Bean
        public ForumService forumService(
                ForumRepository forumRepository,
                MemberService memberService) {
            return new ForumServiceImpl(forumRepository, memberService);
        }
        
        @Bean
        public PostService postService(
                PostRepository postRepository,
                ThreadRepository threadRepository,
                MemberService memberService,
                CommentService commentService) {
            return new PostServiceImpl(postRepository, threadRepository, memberService, commentService);
        }
        
        @Bean
        public CommentService commentService(
                CommentRepository commentRepository,
                PostRepository postRepository,
                MemberService memberService) {
            return new CommentServiceImpl(commentRepository, postRepository, memberService);
        }
    }
}