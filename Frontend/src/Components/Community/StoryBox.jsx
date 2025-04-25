import React from "react";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import StoryCard from "./StoryCard";

const StoryBox = () => {
  const snap = useSnapshot(state);
  return (
    <div>
      <p>Learning Plan Sharing</p>
      <div class="top_box">
        <div
          onClick={() => {
            state.createWorkoutStatusModalOpened = true;
          }}
          class="my_story_card"
        >
          <img alt="alt-tag" src={snap.currentUser?.image} />

          <div class="story_upload">
            <img alt="alt-tag" src="image/upload.png" />
            <p class="story_tag" style={{ textAlign: "center", fontSize: 8 }}>
              Create Learning story
            </p>
          </div>
        </div>
        {snap.storyCards.map((card) => (
          <StoryCard key={card?.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default StoryBox;
