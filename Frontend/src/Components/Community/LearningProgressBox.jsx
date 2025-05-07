// export default LearningProgressBox;
import React, { useState } from "react";
import state from "../../Utils/Store";
import { useSnapshot } from "valtio";

const themeColors = {
  primary: "#7B2CBF",
  secondary: "#4361EE",
  accent: "#06D6A0",
  background: "#F8F9FA",
  surface: "rgba(123, 44, 191, 0.85)",
  cardBg: "#FFFFFF",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.9)",
  textDark: "#212529",
  border: "rgba(255, 255, 255, 0.25)",
  hover: "#9D4EDD",
  danger: "#EF476F",
  success: "#06D6A0",
  gradient: "linear-gradient(135deg, #7B2CBF 0%, #4361EE 100%)",
  gradientHover: "linear-gradient(135deg, #9D4EDD 0%, #5A7AFF 100%)",
};

const LearningProgressBox = () => {
  const snap = useSnapshot(state);
  const [isHovered, setIsHovered] = useState(false);

  const openModal = () => {
    state.CreateLearningProgressModalOpened = true;
  };

  return (
    <div
      className="my_post"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? themeColors.gradientHover
          : themeColors.gradient,
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: isHovered
          ? "0 8px 24px rgba(123, 44, 191, 0.3)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
        marginBottom: "20px",
        color: "white",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
        border: `1px solid ${
          isHovered ? "rgba(255, 255, 255, 0.3)" : "transparent"
        }`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Circles */}
      <div
        style={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          zIndex: 1,
          transition: "transform 0.5s ease-in-out",
          transform: isHovered ? "scale(1.2)" : "scale(1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: -30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          zIndex: 1,
          transition: "transform 0.5s ease-in-out",
          transform: isHovered ? "scale(1.2) translateX(10px)" : "scale(1)",
        }}
      />

      {/* Row Content */}
      <div
        className="post_top"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Left Side: Profile + Input */}
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <img
            alt="profile"
            src={snap.currentUser?.image}
            style={{
              width: "45px",
              height: "45px",
              marginRight: "12px",
              borderRadius: "50%",
              border: "2px solid rgba(255, 255, 255, 0.7)",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          />

          <input
            type="text"
            placeholder="What's your Learning Progress plan?"
            style={{
              flexGrow: 1,
              border: "none",
              padding: "12px 16px",
              borderRadius: "8px",
              color: themeColors.textDark,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              fontSize: "14px",
              transition: "all 0.3s ease",
              boxShadow: isHovered
                ? "0 4px 16px rgba(0, 0, 0, 0.1)"
                : "0 2px 8px rgba(0, 0, 0, 0.05)",
              outline: "none",
              backdropFilter: "blur(4px)",
            }}
            readOnly
          />
        </div>

        {/* Right Side: Button */}
        <button
          onClick={openModal}
          style={{
            background: `linear-gradient(135deg, #4f23a1, #08367a)`, // Dark purple-blue gradient
            color: "#fff",
            border: "none",
            padding: "10px 50px",
            fontSize: "14px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            transition: "all 0.3s",
            marginLeft: "16px",
            border: `2px solid white`, // Using your theme's primary color
            boxShadow: `0 0 0 2px white inset`, // Optional inner glow
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 6px 16px ${themeColors.primary}66`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
          }}
        >
          + Create New
        </button>
      </div>
    </div>
  );
};

export default LearningProgressBox;
