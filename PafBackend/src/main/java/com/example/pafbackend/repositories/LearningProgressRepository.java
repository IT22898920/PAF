package com.example.pafbackend.repositories;

import com.example.pafbackend.models.LearningProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for LearningProgress.
 * This interface handles database operations related to the LearningProgress collection in MongoDB.
 */
@Repository
public interface LearningProgressRepository extends MongoRepository<LearningProgress, String> {

    /**
     * Custom method to find all learning progress records by a specific user ID.
     * @param userId the ID of the user
     * @return a list of LearningProgress records belonging to the given user
     */
    List<LearningProgress> findByUserId(String userId);
}
