package com.example.pafbackend.controllers;

import com.example.pafbackend.models.StoryStatusUpdate;
import com.example.pafbackend.repositories.StoryStatusUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workoutStatusUpdates")
public class StoryStatusUpdateController {

    private final StoryStatusUpdateRepository workoutStatusUpdateRepository;

    @Autowired
    public StoryStatusUpdateController(StoryStatusUpdateRepository workoutStatusUpdateRepository) {
        this.workoutStatusUpdateRepository = workoutStatusUpdateRepository;
    }

    // Get all workout status updates
    @GetMapping
    public ResponseEntity<List<StoryStatusUpdate>> getUpdatesByUserId() {
        List<StoryStatusUpdate> updates = workoutStatusUpdateRepository.findAll();
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    // Get workout status updates by user ID
    @GetMapping("/{userId}")
    public ResponseEntity<List<StoryStatusUpdate>> getUpdatesByUserId(@PathVariable String userId) {
        List<StoryStatusUpdate> updates = workoutStatusUpdateRepository.findByUserId(userId);
        return new ResponseEntity<>(updates, HttpStatus.OK);
    }

    // Get workout status updates by ID
    @PostMapping
    public ResponseEntity<StoryStatusUpdate> createUpdate(@RequestBody StoryStatusUpdate update) {
        StoryStatusUpdate savedUpdate = workoutStatusUpdateRepository.save(update);
        return new ResponseEntity<>(savedUpdate, HttpStatus.CREATED);
    }
    // Delete workout status update by ID

    @DeleteMapping("/{updateId}")
    public ResponseEntity<Void> deleteUpdate(@PathVariable String updateId) {
        workoutStatusUpdateRepository.deleteById(updateId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Update workout status update by ID
    @PutMapping("/{updateId}")
    public ResponseEntity<StoryStatusUpdate> updateUpdate(@PathVariable String updateId, @RequestBody StoryStatusUpdate updateDetails) {
        return workoutStatusUpdateRepository.findById(updateId)
                .map(existingUpdate -> {
                    existingUpdate.setTitle(updateDetails.getTitle());
                    existingUpdate.setImage(updateDetails.getImage());
                    existingUpdate.setDescription(updateDetails.getDescription());
                    StoryStatusUpdate updatedUpdate = workoutStatusUpdateRepository.save(existingUpdate);
                    return ResponseEntity.ok(updatedUpdate);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
