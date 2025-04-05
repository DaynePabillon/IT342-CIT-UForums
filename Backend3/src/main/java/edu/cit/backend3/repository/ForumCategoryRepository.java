package edu.cit.backend3.repository;

import edu.cit.backend3.models.ForumCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Long> {
    List<ForumCategory> findByName(String name);
} 