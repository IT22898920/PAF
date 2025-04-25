import React from "react";
import "../../Styles/right_section.css";
import Contacts from "./Contacts";
const RightSection = () => {
  return (
    <div class="right">
      <div class="first_warpper">
        <div class="page">
          <h2>Your Pages and profiles</h2>
          <div class="menu">
            <i class="fa-solid fa-ellipsis"></i>
          </div>
        </div>

        <div class="page_img">
          <img alt="alt-tag" src="image/page.jpg" />
          <p>Web Designer</p>
        </div>

        <div class="page_icon">
          <i class="fa-regular fa-bell"></i>
          <p>20 Notifications</p>
        </div>

        <div class="page_icon">
          <i class="fa-solid fa-bullhorn"></i>
          <p>Create promotion</p>
        </div>
      </div>

      <hr />

      <hr />
    </div>
  );
};

export default RightSection;
