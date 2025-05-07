import React, { useState } from "react";
import state from "../../Utils/Store";
import { useSnapshot } from "valtio";

// Theme colors - Updated with a modern blue/purple palette
const themeColors = {
  primary: "#4361EE", // Rich blue as primary color
  secondary: "#3F8EFC", // Lighter blue for secondary elements
  accent: "#7209B7", // Vibrant purple for accents
  background: "#F8F9FA", // Light gray background
  surface: "#FFFFFF", // White surface
  cardBg: "#FFFFFF", // White background for cards
  textPrimary: "#1F2937", // Dark gray for primary text
  textSecondary: "#6B7280", // Medium gray for secondary text
  border: "rgba(0, 0, 0, 0.08)", // Subtle border
  hover: "#3A56D4", // Darker blue for hover states
  danger: "#EF4444", // Red for danger/warning
  success: "#10B981", // Green for success
  gradient: "linear-gradient(135deg, #4361EE 0%, #3F8EFC 100%)", // Blue gradient
};

const MyPost = () => {
  const snap = useSnapshot(state);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="my_post"
      onClick={() => {
        state.createPostModalOpened = true;
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: themeColors.gradient,
        padding: "18px 24px",
        borderRadius: "16px",
        boxShadow: isHovered
          ? "0 12px 28px rgba(67, 97, 238, 0.2)"
          : "0 6px 16px rgba(0, 0, 0, 0.06)",
        marginBottom: "24px",
        color: "white",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        border: `1px solid ${
          isHovered ? "rgba(255, 255, 255, 0.2)" : "transparent"
        }`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          right: -25,
          top: -25,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          zIndex: 1,
          transition: "transform 0.5s ease-in-out",
          transform: isHovered ? "scale(1.2)" : "scale(1)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 15,
          bottom: -35,
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          zIndex: 1,
          transition: "transform 0.5s ease-in-out",
          transform: isHovered ? "scale(1.2) translateX(10px)" : "scale(1)",
        }}
      />

      <div
        className="post_top"
        style={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <img
          alt={snap.currentUser?.username || "Profile"}
          src={snap.currentUser?.image}
          style={{
            width: "48px",
            height: "48px",
            marginRight: "16px",
            borderRadius: "50%",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            boxShadow: isHovered ? "0 4px 12px rgba(0, 0, 0, 0.12)" : "none",
            objectFit: "cover",
          }}
        />
        <input
          type="text"
          placeholder="Share your skill or experience"
          style={{
            flexGrow: 1,
            border: "none",
            padding: "14px 18px",
            borderRadius: "12px",
            color: themeColors.textPrimary,
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            fontSize: "15px",
            fontWeight: "500",
            transition: "all 0.3s ease",
            boxShadow: isHovered
              ? "0 6px 16px rgba(0, 0, 0, 0.08)"
              : "0 2px 8px rgba(0, 0, 0, 0.04)",
            outline: "none",
          }}
          readOnly
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default MyPost;
