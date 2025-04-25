package com.example.pafbackend.repositories;

import com.example.pafbackend.models.LearningProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningProgressRepository extends MongoRepository<LearningProgress, String> {
    List<LearningProgress> findByUserId(String userId);
}
