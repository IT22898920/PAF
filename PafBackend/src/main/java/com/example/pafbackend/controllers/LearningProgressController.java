package com.example.pafbackend.controllers;

import com.example.pafbackend.models.LearningProgress;
import com.example.pafbackend.repositories.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/LearningProgresss")
public class LearningProgressController {

    private final LearningProgressRepository LearningProgressRepository;

    @Autowired
    public LearningProgressController(LearningProgressRepository LearningProgressRepository) {
        this.LearningProgressRepository = LearningProgressRepository;
    }

    @GetMapping
    public ResponseEntity<List<LearningProgress>> getLearningProgresss() {
        List<LearningProgress> LearningProgresss = LearningProgressRepository.findAll();
        return new ResponseEntity<>(LearningProgresss, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<LearningProgress>> getLearningProgresssByUserId(@PathVariable String userId) {
        List<LearningProgress> LearningProgresss = LearningProgressRepository.findByUserId(userId);
        return new ResponseEntity<>(LearningProgresss, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<LearningProgress> createLearningProgress(@RequestBody LearningProgress LearningProgress) {
        LearningProgress savedLearningProgress = LearningProgressRepository.save(LearningProgress);
        return new ResponseEntity<>(savedLearningProgress, HttpStatus.CREATED);
    }

    @DeleteMapping("/{LearningProgressId}")
    public ResponseEntity<Void> deleteLearningProgress(@PathVariable String LearningProgressId) {
        LearningProgressRepository.deleteById(LearningProgressId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
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
