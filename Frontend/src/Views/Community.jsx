import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/community.css";
import CenterSection from "../Components/Community/CenterSection";
import UserProfileModal from "../Components/Modals/UserProfileModal";
import CreateStoryModal from "../Components/Modals/CreateStoryModal";
import WorkoutStory from "../Components/Modals/UpdateStory";
import StoryService from "../Services/StoryService";
import state from "../Utils/Store";
import { useSnapshot } from "valtio";
import CreatePostModal from "../Components/Modals/CreatePostModal";
import UserService from "../Services/UserService";
import UploadPostModal from "../Components/Modals/UploadPostModal";
import CreateLearningProgressModal from "../Components/Modals/CreateLearningProgressModal";
import LearningProgressService from "../Services/LearningProgressService";
import EditLearningProgressModal from "../Components/Modals/EditLearningProgressModal";
import UpdateSkillShareModal from "../Components/Modals/UpdateSkillShareModal";
import CreateSkillShareModal from "../Components/Modals/CreateSkillShareModal";
import SkillShareService from "../Services/SkillShareService";
import FriendProfileModal from "../Components/Modals/FriendProfileModal";
import { message } from "antd";

const Community = () => {
  const snap = useSnapshot(state);
  const navigate = useNavigate();
  const [isAuthModalOpened, setIsAuthModalOpened] = useState(false);

  // Custom styles for the component
  const styles = {
    container: {
      backgroundColor: "#e2ecff",
      minHeight: "100vh",
    },
    header: {
      backgroundColor: "#002D69 ",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    },
    nav: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "16px 24px",
    },
    navHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logo: {
      display: "flex",
      alignItems: "center",
    },
    logoImg: {
      height: "36px",
    },
    menuBtn: {
      display: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: "#4361EE",
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "32px",
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
    link: {
      color: "#ffffff",//nav_link_color
      textDecoration: "none",
      fontWeight: 500,
      transition: "color 0.2s ease",
    },
    button: {
      backgroundColor: "#4361EE",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 6px rgba(67, 97, 238, 0.2)",
    },
    main: {
      maxWidth: "1280px",
      margin: "32px auto",
      padding: "0 24px",
    },
  };

  const getWorkoutStories = async () => {
    try {
      const response = await StoryService.getAllWorkoutStories();
      state.storyCards = response;
    } catch (error) {
      console.log("Failed to fetch workout stories", error);
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await UserService.getProfiles();
      state.users = response;
    } catch (error) {
      console.log("Failed to fetch users", error);
    }
  };

  const getLearningProgresss = async () => {
    try {
      const response = await LearningProgressService.getAllLearningProgresss();
      state.LearningProgresss = response;
    } catch (error) {
      console.log("Failed to fetch Learning Progresss ", error);
    }
  };

  const getSkillShares = async () => {
    try {
      const response = await SkillShareService.getAllSkillShares();
      state.SkillShares = response;
    } catch (error) {
      console.log("Failed to fetch Skill Shares", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      UserService.getProfile()
        .then((response) => {
          state.currentUser = response;
          message.success("Welcome");
        })
        .catch(() => {
          message.error("Failed to fetch user profile");
        });
    }
    getAllUsers().then(() => {
      getWorkoutStories();
      getLearningProgresss();
      getSkillShares();
    });
  }, []);

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div className="nav__header" style={styles.navHeader}>
            <div className="nav__logo">
              <Link to="/" style={styles.logo}>
                <img
                  src="/assets/skillflow.svg"
                  alt="logo"
                  style={styles.logoImg}
                />
              </Link>
            </div>
            <div
              className="nav__menu__btn"
              id="menu-btn"
              style={styles.menuBtn}
            >
              <span>
                <i className="ri-menu-line"></i>
              </span>
            </div>
          </div>
          <ul className="nav__links" id="nav-links" style={styles.navLinks}>
            <li className="link">
              <Link to="/" style={styles.link}>
                Contact Us
              </Link>
            </li>
            <li className="link">
              <Link to="#browse-skills" style={styles.link}>
                Browse Skills
              </Link>
            </li>
            <li className="link">
              <Link
                to="/community"
                onClick={() => {
                  if (!localStorage.getItem("userId")) {
                    setIsAuthModalOpened(true);
                  }
                }}
                style={styles.link}
              >
                Share Skills
              </Link>
            </li>
            <li className="link">
              <button
                onClick={() => {
                  if (localStorage.getItem("userId")) {
                    navigate("/");
                  } else {
                    setIsAuthModalOpened(true);
                  }
                }}
                style={styles.button}
              >
                SkillFlow Home
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <div className="main" style={styles.main}>
        <CenterSection />
      </div>

      <UserProfileModal />
      <CreateStoryModal />
      <CreateLearningProgressModal />
      <CreateSkillShareModal />
      {snap.selectedWorkoutStory && <WorkoutStory />}
      <CreatePostModal />
      {snap.selectedPost && <UploadPostModal />}
      {snap.selectedLearningProgress && <EditLearningProgressModal />}
      {snap.seletedSkillShareToUpdate && <UpdateSkillShareModal />}
      {snap.selectedUserProfile && <FriendProfileModal />}
    </div>
  );
};

export default Community;
