package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Document(collection = "LearningProgresss")
@Getter
@Setter
public class LearningProgress {
    @Id
    private String id;
    private String userId;
    private String routines;
    private String planName;
    private String description;
    private String goal;
}
