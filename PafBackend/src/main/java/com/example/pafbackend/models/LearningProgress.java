package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

/**
 * Model class representing the Learning Progress of a user.
 * This class is mapped to the "LearningProgresss" collection in MongoDB.
 */
@Document(collection = "LearningProgresss")
@Getter
@Setter
public class LearningProgress {

    /** Unique identifier for each learning progress record */
    @Id
    private String id;

    /** ID of the user who owns this learning progress */
    private String userId;

    /** Learning routines followed by the user (example: daily reading, weekly writing) */
    private String routines;

    /** Name of the learning plan (example: Improve English Speaking) */
    private String planName;

    /** Description providing more details about the learning activities */
    private String description;

    /** Goal set by the user (example: Become fluent in English in 6 months) */
    private String goal;
}
