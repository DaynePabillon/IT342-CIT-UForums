package edu.cit.backend3.config;

import edu.cit.backend3.models.Forum;
import edu.cit.backend3.models.ForumCategory;
import edu.cit.backend3.models.Member;
import edu.cit.backend3.repository.ForumCategoryRepository;
import edu.cit.backend3.repository.ForumRepository;
import edu.cit.backend3.repository.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ForumRepository forumRepository;
    
    @Autowired
    private ForumCategoryRepository forumCategoryRepository;

    @Override
    public void run(String... args) {
        try {
            // Initialize users
            initializeUsers();
            
            // Initialize forums
            initializeForums();
        } catch (Exception e) {
            logger.error("Error during data initialization: {}", e.getMessage());
            logger.debug("Initialization error details", e);
            // Continue application startup even if initialization fails
        }
    }
    
    private void initializeUsers() {
        // Check if admin user exists by username or email
        if (!memberRepository.existsByName("admin") && !memberRepository.existsByEmail("admin@cituforums.com")) {
            logger.info("Creating default admin user");
            
            Member admin = new Member();
            admin.setName("admin");
            admin.setEmail("admin@cituforums.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setAdmin(true);
            admin.setActive(true);
            admin.setCreatedAt(LocalDateTime.now());
            
            memberRepository.save(admin);
            logger.info("Default admin user created successfully");
        } else {
            // If admin exists but we're having login issues, update the admin user
            try {
                List<Member> admins = memberRepository.findByNameOrEmail("admin", "admin@cituforums.com");
                if (!admins.isEmpty()) {
                    Member admin = admins.get(0);
                    // Ensure the admin has the correct credentials
                    admin.setName("admin");
                    admin.setEmail("admin@cituforums.com");
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setAdmin(true);
                    admin.setActive(true);
                    
                    memberRepository.save(admin);
                    logger.info("Updated existing admin user");
                } else {
                    logger.info("Admin user exists but could not be found for update");
                }
            } catch (Exception e) {
                logger.error("Error updating admin user: {}", e.getMessage());
            }
        }
        
        // Check if test user exists by username or email
        if (!memberRepository.existsByName("user") && !memberRepository.existsByEmail("user@cituforums.com")) {
            logger.info("Creating default test user");
            
            Member user = new Member();
            user.setName("user");
            user.setEmail("user@cituforums.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setFirstName("Test");
            user.setLastName("User");
            user.setAdmin(false);
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            
            memberRepository.save(user);
            logger.info("Default test user created successfully");
        } else {
            // If user exists but we're having login issues, update the test user
            try {
                List<Member> users = memberRepository.findByNameOrEmail("user", "user@cituforums.com");
                if (!users.isEmpty()) {
                    Member user = users.get(0);
                    // Ensure the user has the correct credentials
                    user.setName("user");
                    user.setEmail("user@cituforums.com");
                    user.setPassword(passwordEncoder.encode("user123"));
                    user.setAdmin(false);
                    user.setActive(true);
                    
                    memberRepository.save(user);
                    logger.info("Updated existing test user");
                } else {
                    logger.info("Test user exists but could not be found for update");
                }
            } catch (Exception e) {
                logger.error("Error updating test user: {}", e.getMessage());
            }
        }
    }
    
    private void initializeForums() {
        // Get admin user for forum creation - first try to find by name or email
        List<Member> admins = memberRepository.findByNameOrEmail("admin", "admin@cituforums.com");
        
        if (admins.isEmpty()) {
            logger.warn("Admin user not found, skipping forum initialization");
            return;
        }
        
        Member admin = admins.get(0);
        logger.info("Found admin user for forum creation: id={}, name={}", admin.getId(), admin.getName());
        
        // Create example forums for each category if they don't exist
        createForumIfNotExists("Announcements", "Important announcements from CIT-U administration", "ANNOUNCEMENTS", admin);
        createForumIfNotExists("Events", "Upcoming events at CIT-U", "EVENTS", admin);
        createForumIfNotExists("Freedom Wall", "Express yourself freely", "FREEDOM_WALL", admin);
        createForumIfNotExists("Confession Board", "Share your anonymous confessions", "CONFESSION", admin);
        createForumIfNotExists("Academic Discussions", "Discuss academic topics and courses", "ACADEMIC", admin);
        createForumIfNotExists("General Discussions", "General topics for CIT-U students", "GENERAL", admin);
        createForumIfNotExists("Technology Corner", "Discuss the latest in tech", "TECHNOLOGY", admin);
        createForumIfNotExists("Sports Talk", "All about sports and athletics", "SPORTS", admin);
        createForumIfNotExists("Entertainment", "Movies, music, games and more", "ENTERTAINMENT", admin);
    }
    
    private void createForumIfNotExists(String title, String description, String categoryName, Member creator) {
        // Check if forum with this title already exists
        if (forumRepository.existsByTitle(title)) {
            logger.info("Forum '{}' already exists", title);
            return;
        }
        
        // Get or create category
        List<ForumCategory> categories = forumCategoryRepository.findByName(categoryName);
        ForumCategory category;
        
        if (categories.isEmpty()) {
            // Create new category if it doesn't exist
            category = new ForumCategory();
            category.setName(categoryName);
            category = forumCategoryRepository.save(category);
            logger.info("Created new category: {}", categoryName);
        } else {
            category = categories.get(0);
        }
        
        // Create new forum
        Forum forum = new Forum();
        forum.setTitle(title);
        forum.setDescription(description);
        forum.setCategory(category);
        forum.setCreatedBy(creator);
        forum.setCreatedAt(LocalDateTime.now());
        forum.setLastActivity(LocalDateTime.now());
        
        forumRepository.save(forum);
        logger.info("Created forum: {}", title);
    }
}
