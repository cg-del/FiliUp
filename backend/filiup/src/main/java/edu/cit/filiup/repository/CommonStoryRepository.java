package edu.cit.filiup.repository;

import edu.cit.filiup.entity.CommonStoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommonStoryRepository extends JpaRepository<CommonStoryEntity, Long> {
} 