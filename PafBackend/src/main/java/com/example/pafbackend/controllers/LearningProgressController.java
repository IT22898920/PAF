package com.example.pafbackend.controllers;

import com.example.pafbackend.models.LearningProgress;
import com.example.pafbackend.repositories.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controller class for managing Learning Progress records.
 * Handles all CRUD operations through REST API endpoints.
 */
@RestController
@RequestMapping("/api/LearningProgresss")
public class LearningProgressController {

    private final LearningProgressRepository LearningProgressRepository;

    /**
     * Constructor-based dependency injection for LearningProgressRepository.
     */
    @Autowired

    public LearningProgressController(LearningProgressRepository LearningProgressRepository) {
        this.LearningProgressRepository = LearningProgressRepository;
    }
    //get all learning progress

    /**
     * GET endpoint to retrieve all learning progress records.
     * @return List of all learning progress records.
     */
    @GetMapping
    public ResponseEntity<List<LearningProgress>> getLearningProgresss() {
        List<LearningProgress> LearningProgresss = LearningProgressRepository.findAll();
        return new ResponseEntity<>(LearningProgresss, HttpStatus.OK);
    }

    /**
     * GET endpoint to retrieve learning progress records by user ID.
     * @param userId the ID of the user
     * @return List of learning progress records for the given user.
     */
    //adding user ID
    @GetMapping("/{userId}")
    public ResponseEntity<List<LearningProgress>> getLearningProgresssByUserId(@PathVariable String userId) {
        List<LearningProgress> LearningProgresss = LearningProgressRepository.findByUserId(userId);
        return new ResponseEntity<>(LearningProgresss, HttpStatus.OK);
    }

    /**
     * POST endpoint to create a new learning progress record.
     * @param LearningProgress the new learning progress object to be saved
     * @return The saved learning progress object.
     */
    //get learning progress by id
    @PostMapping
    public ResponseEntity<LearningProgress> createLearningProgress(@RequestBody LearningProgress LearningProgress) {
        LearningProgress savedLearningProgress = LearningProgressRepository.save(LearningProgress);
        return new ResponseEntity<>(savedLearningProgress, HttpStatus.CREATED);
    }

    /**
     * DELETE endpoint to delete a learning progress record by its ID.
     * @param LearningProgressId the ID of the record to be deleted
     * @return HTTP status indicating success or failure.
     */
    //add delete method
    @DeleteMapping("/{LearningProgressId}")
    public ResponseEntity<Void> deleteLearningProgress(@PathVariable String LearningProgressId) {
        LearningProgressRepository.deleteById(LearningProgressId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /**
     * PUT endpoint to update an existing learning progress record.
     * @param LearningProgressId the ID of the record to update
     * @param updatedLearningProgress the updated learning progress object
     * @return The updated learning progress object if found, otherwise NOT FOUND status.
     */

    //add update method
    @PutMapping("/{LearningProgressId}")
    public ResponseEntity<LearningProgress> updateLearningProgress(@PathVariable String LearningProgressId, @RequestBody LearningProgress updatedLearningProgress) {
        Optional<LearningProgress> existingLearningProgressOptional = LearningProgressRepository.findById(LearningProgressId);
        
        if (existingLearningProgressOptional.isPresent()) {
            LearningProgress existingLearningProgress = existingLearningProgressOptional.get();
            
            // Update the existing Learning Progress with the new details
            existingLearningProgress.setUserId(updatedLearningProgress.getUserId());
            existingLearningProgress.setRoutines(updatedLearningProgress.getRoutines());
            existingLearningProgress.setPlanName(updatedLearningProgress.getPlanName());
            existingLearningProgress.setDescription(updatedLearningProgress.getDescription());
            existingLearningProgress.setGoal(updatedLearningProgress.getGoal());

            // Save the updated Learning Progress
            LearningProgress savedLearningProgress = LearningProgressRepository.save(existingLearningProgress);
            return new ResponseEntity<>(savedLearningProgress, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
