import React, { useEffect, useState } from "react";
import { List, Avatar } from "antd";
import axios from "axios";
import UserService from "../../Services/UserService";
import { BASE_URL } from "../../constants";
import state from "../../Utils/Store";

// Theme colors matching our new blue/purple palette
const themeColors = {
  primary: "#4361EE",
  secondary: "#3F8EFC",
  accent: "#7209B7",
  background: "#F8F9FA",
  surface: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  border: "rgba(0, 0, 0, 0.08)",
  hover: "#3A56D4",
  cardShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  cardShadowHover: "0 8px 16px rgba(67, 97, 238, 0.15)",
};

const CommentCard = ({ comment }) => {
  const [userData, setUserData] = useState();
  const [isHovered, setIsHovered] = useState(false);

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const result = await UserService.getProfileById(comment.userId);
      const result2 = await axios.get(
        `${BASE_URL}/users/${result.userId}`,
        config
      );
      setUserData({ ...result2.data, ...result });
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [comment.id]);

  // Custom styles for the component
  const styles = {
    listItem: {
      padding: "16px",
      borderRadius: "12px",
      backgroundColor: themeColors.surface,
      boxShadow: isHovered
        ? themeColors.cardShadowHover
        : themeColors.cardShadow,
      transition: "all 0.3s ease",
      border: `1px solid ${themeColors.border}`,
      marginBottom: "12px",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
    },
    container: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      width: "100%",
      gap: "16px",
    },
    avatarContainer: {
      cursor: "pointer",
      transition: "transform 0.2s ease",
      transform: isHovered ? "scale(1.05)" : "scale(1)",
    },
    customAvatar: {
      border: `2px solid ${themeColors.primary}`,
      boxShadow: isHovered ? "0 3px 8px rgba(67, 97, 238, 0.2)" : "none",
      transition: "all 0.3s ease",
    },
    contentContainer: {
      flex: 1,
      backgroundColor: themeColors.background,
      padding: "14px 18px",
      borderRadius: "10px",
      transition: "all 0.3s ease",
      boxShadow: isHovered ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "none",
    },
    commentText: {
      margin: 0,
      color: themeColors.textPrimary,
      fontSize: "15px",
      fontWeight: "normal",
      lineHeight: "1.5",
    },
    username: {
      margin: "0 0 4px 0",
      color: themeColors.primary,
      fontSize: "14px",
      fontWeight: "600",
    },
    timestamp: {
      color: themeColors.textSecondary,
      fontSize: "12px",
      marginTop: "6px",
    },
  };

  return (
    <List.Item
      key={comment.id}
      style={styles.listItem}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {userData && (
        <div style={styles.container}>
          <div
            style={styles.avatarContainer}
            onClick={() => {
              state.selectedUserProfile = userData;
              state.friendProfileModalOpened = true;
            }}
          >
            <Avatar
              size={46}
              src={userData.image}
              style={styles.customAvatar}
            />
          </div>

          <div style={styles.contentContainer}>
            <h5 style={styles.username}>{userData.username || "User"}</h5>
            <p style={styles.commentText}>{comment.commentText}</p>

            {comment.createdAt && (
              <div style={styles.timestamp}>
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </List.Item>
  );
};

export default CommentCard;
