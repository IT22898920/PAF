import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "../Modals/AuthModal";

// Enhanced professional color palette
const themeColors = {
  // Primary colors
  primary: "#4361EE",
  primaryDark: "#3A56D4",
  primaryLight: "#EEF2FF",

  // Secondary colors
  secondary: "#7209B7",
  secondaryLight: "#F4EBFF",
  accent: "#4CC9F0",

  // UI colors
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceHover: "#F1F5F9",

  // Text colors
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textLight: "#94A3B8",

  // Utility colors
  border: "rgba(226, 232, 240, 0.8)",
  shadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  shadowHover:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",

  // Gradients
  primaryGradient: "linear-gradient(135deg, #4361EE 0%, #3A56D4 100%)",
  accentGradient: "linear-gradient(135deg, #7209B7 0%, #4361EE 100%)",
  subtleGradient:
    "linear-gradient(to right, rgba(67, 97, 238, 0.08), rgba(114, 9, 183, 0.08))",
};

const Header = () => {
  const navigate = useNavigate();
  const [isAuthModalOpened, setIsAuthModalOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Animation for elements to fade in on load
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Custom styles with enhanced professional look
  const styles = {
    header: {
      backgroundColor: themeColors.background,
      position: "relative",
      overflow: "hidden",
    },
    // Decorative elements
    topDecoration: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "40%",
      height: "100%",
      background: themeColors.subtleGradient,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 20% 100%)",
      zIndex: 0,
      opacity: 0.6,
    },
    circleDecoration1: {
      position: "absolute",
      top: "15%",
      right: "10%",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(67, 97, 238, 0.05) 0%, rgba(67, 97, 238, 0) 70%)",
      zIndex: 0,
    },
    circleDecoration2: {
      position: "absolute",
      bottom: "10%",
      left: "5%",
      width: "200px",
      height: "200px",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(114, 9, 183, 0.05) 0%, rgba(114, 9, 183, 0) 70%)",
      zIndex: 0,
    },
    // Navigation styles
    navigation: {
      backgroundColor: scrolled ? themeColors.surface : "transparent",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      padding: scrolled ? "12px 24px" : "16px 24px",
      boxShadow: scrolled ? themeColors.shadow : "none",
      position: "sticky",
      top: 0,
      zIndex: 100,
      transition: "all 0.3s ease",
    },
    navContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      maxWidth: "1280px",
      margin: "0 auto",
    },
    navLogo: {
      display: "flex",
      alignItems: "center",
    },
    logoImage: {
      height: "40px",
      transition: "transform 0.3s ease",
      transform: loaded ? "translateY(0)" : "translateY(-20px)",
      opacity: loaded ? 1 : 0,
    },
    menuBtn: {
      display: "none",
      fontSize: "24px",
      cursor: "pointer",
      color: themeColors.primary,
      "@media (max-width: 768px)": {
        display: "block",
      },
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "40px",
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    navLink: {
      position: "relative",
      transition: "all 0.3s ease",
      opacity: loaded ? 1 : 0,
      transform: loaded ? "translateY(0)" : "translateY(-10px)",
    },
    link: (isActive) => ({
      color: isActive ? themeColors.primary : themeColors.textPrimary,
      textDecoration: "none",
      fontWeight: 500,
      fontSize: "16px",
      padding: "8px 4px",
      position: "relative",
      transition: "all 0.3s ease",
      "&::after": {
        content: "''",
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "2px",
        backgroundColor: themeColors.primary,
        transform: isActive ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.3s ease",
      },
    }),
    joinButton: {
      backgroundColor: themeColors.primary,
      color: "white",
      border: "none",
      borderRadius: "10px",
      padding: "12px 24px",
      fontSize: "15px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(67, 97, 238, 0.25)",
      transform: loaded ? "translateY(0)" : "translateY(-10px)",
      opacity: loaded ? 1 : 0,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: "''",
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
        transition: "all 0.5s ease",
      },
    },
    // Hero section styles
    headerContainer: {
      display: "flex",
      alignItems: "center",
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "80px 24px 100px",
      gap: "60px",
      position: "relative",
      zIndex: 1,
      "@media (max-width: 992px)": {
        flexDirection: "column-reverse",
        padding: "60px 24px 80px",
      },
    },
    headerImageContainer: {
      flex: 1,
      position: "relative",
      transform: loaded ? "translateX(0)" : "translateX(50px)",
      opacity: loaded ? 1 : 0,
      transition: "all 0.6s ease 0.2s",
    },
    headerImage: {
      width: "100%",
      maxWidth: "600px",
      borderRadius: "16px",
      boxShadow: "0 20px 30px rgba(67, 97, 238, 0.12)",
      transform: "perspective(1000px) rotateY(-5deg)",
      transition: "all 0.5s ease",
      border: `1px solid ${themeColors.border}`,
      "&:hover": {
        transform: "perspective(1000px) rotateY(0deg)",
      },
    },
    imageGlow: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      height: "80%",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(67, 97, 238, 0.08) 0%, rgba(67, 97, 238, 0) 70%)",
      filter: "blur(40px)",
      zIndex: -1,
    },
    headerContent: {
      flex: 1,
      paddingRight: "40px",
      transform: loaded ? "translateX(0)" : "translateX(-50px)",
      opacity: loaded ? 1 : 0,
      transition: "all 0.6s ease",
      "@media (max-width: 992px)": {
        paddingRight: 0,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
    },
    subheading: {
      color: themeColors.secondary,
      fontSize: "18px",
      fontWeight: 600,
      margin: "0 0 8px 0",
      letterSpacing: "0.5px",
      display: "flex",
      alignItems: "center",
      "&::before": {
        content: "''",
        display: "inline-block",
        width: "30px",
        height: "2px",
        backgroundColor: themeColors.secondary,
        marginRight: "12px",
        "@media (max-width: 992px)": {
          display: "none",
        },
      },
    },
    mainHeading: {
      color: themeColors.textPrimary,
      fontSize: "48px",
      fontWeight: 800,
      margin: "0 0 24px 0",
      lineHeight: 1.2,
      backgroundImage: "linear-gradient(135deg, #1E293B 0%, #4361EE 100%)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      "@media (max-width: 768px)": {
        fontSize: "36px",
      },
    },
    description: {
      color: themeColors.textSecondary,
      fontSize: "18px",
      lineHeight: 1.7,
      marginBottom: "40px",
      maxWidth: "600px",
    },
    headerBtn: {
      display: "flex",
      gap: "16px",
      "@media (max-width: 992px)": {
        justifyContent: "center",
      },
    },
    heroButton: {
      backgroundColor: themeColors.primary,
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px 32px",
      fontSize: "16px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 16px rgba(67, 97, 238, 0.25)",
      position: "relative",
      overflow: "hidden",
      "&::after": {
        content: "''",
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
        transition: "all 0.5s ease",
      },
    },
  };

  // Function to handle button hover animation
  const handleButtonHover = (e, enter) => {
    if (enter) {
      e.target.style.backgroundColor = themeColors.primaryDark;
      e.target.style.transform = "translateY(-3px)";
      e.target.style.boxShadow = "0 12px 24px rgba(67, 97, 238, 0.35)";
      // Trigger shine effect
      e.target.style.setProperty("&::after", "left: 100%");
    } else {
      e.target.style.backgroundColor = themeColors.primary;
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 8px 16px rgba(67, 97, 238, 0.25)";
    }
  };

  return (
    <header style={styles.header}>
      {/* Decorative elements */}
      <div style={styles.topDecoration}></div>
      <div style={styles.circleDecoration1}></div>
      <div style={styles.circleDecoration2}></div>

      {/* Navigation Bar */}
      <nav style={styles.navigation}>
        <div style={styles.navContainer}>
          <div className="nav__logomain" style={styles.navLogo}>
            <Link to="#">
              <img
                src="/assets/skillflow.svg"
                alt="SkillFlow"
                style={styles.logoImage}
              />
            </Link>
          </div>

          <div className="nav__menu__btn" id="menu-btn" style={styles.menuBtn}>
            <span>
              <i className="ri-menu-line"></i>
            </span>
          </div>

          <ul className="nav__links" id="nav-links" style={styles.navLinks}>
            <li
              className="link"
              style={{ ...styles.navLink, transitionDelay: "0.1s" }}
            >
              <Link
                to="/"
                style={{
                  ...styles.link(activeLink === "contact"),
                  color:
                    activeLink === "contact"
                      ? themeColors.primary
                      : themeColors.textPrimary,
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = themeColors.primary;
                  e.target.style.setProperty("--scale", "1");
                }}
                onMouseLeave={(e) => {
                  if (activeLink !== "contact") {
                    e.target.style.color = themeColors.textPrimary;
                  }
                }}
                onClick={() => setActiveLink("contact")}
              >
                Contact Us
              </Link>
            </li>
            <li
              className="link"
              style={{ ...styles.navLink, transitionDelay: "0.2s" }}
            >
              <Link
                to="#browse-skills"
                style={{
                  ...styles.link(activeLink === "browse"),
                  color:
                    activeLink === "browse"
                      ? themeColors.primary
                      : themeColors.textPrimary,
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = themeColors.primary;
                }}
                onMouseLeave={(e) => {
                  if (activeLink !== "browse") {
                    e.target.style.color = themeColors.textPrimary;
                  }
                }}
                onClick={() => setActiveLink("browse")}
              >
                Discover Skills
              </Link>
            </li>
            <li
              className="link"
              style={{ ...styles.navLink, transitionDelay: "0.3s" }}
            >
              <Link
                to="/community"
                onClick={() => {
                  setActiveLink("share");
                  if (!localStorage.getItem("userId")) {
                    setIsAuthModalOpened(true);
                  }
                }}
                style={{
                  ...styles.link(activeLink === "share"),
                  color:
                    activeLink === "share"
                      ? themeColors.primary
                      : themeColors.textPrimary,
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = themeColors.primary;
                }}
                onMouseLeave={(e) => {
                  if (activeLink !== "share") {
                    e.target.style.color = themeColors.textPrimary;
                  }
                }}
              >
                Share Your Expertise
              </Link>
            </li>
            <li
              className="link"
              style={{ ...styles.navLink, transitionDelay: "0.4s" }}
            >
              <button
                onClick={() => {
                  if (localStorage.getItem("userId")) {
                    navigate("/community");
                  } else {
                    setIsAuthModalOpened(true);
                  }
                }}
                className="btn"
                style={styles.joinButton}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Join SkillFlow
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="section__container header__container"
        id="home"
        style={styles.headerContainer}
      >
        <div className="header__content" style={styles.headerContent}>
          <h4 style={styles.subheading}>Learn New Skills &</h4>
          <h1 className="section__header" style={styles.mainHeading}>
            Unlock Your Potential with SkillFlow!
          </h1>
          <p style={styles.description}>
            Explore a diverse range of skills, from tech to creativity, business
            to wellness. Join our vibrant community of learners and experts to
            accelerate your growth and share your knowledge in a supportive
            environment.
          </p>
          <div className="header__btn" style={styles.headerBtn}>
            <button
              onClick={() => {
                if (localStorage.getItem("userId")) {
                  navigate("/community");
                } else {
                  setIsAuthModalOpened(true);
                }
              }}
              className="btn"
              style={styles.heroButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = themeColors.primaryDark;
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow =
                  "0 12px 24px rgba(67, 97, 238, 0.35)";
                // Animate the shine effect
                const after = e.target.querySelector("::after");
                if (after) after.style.left = "100%";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = themeColors.primary;
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 16px rgba(67, 97, 238, 0.25)";
              }}
            >
              Start Learning Today
            </button>
          </div>
        </div>

        <div style={styles.headerImageContainer}>
          <div style={styles.imageGlow}></div>
          <img
            src="/assets/skillflowhd.svg"
            alt="SkillFlow Platform"
            style={styles.headerImage}
          />
        </div>
      </div>

      <AuthModal
        onClose={() => {
          setIsAuthModalOpened(false);
        }}
        isOpen={isAuthModalOpened}
      />
    </header>
  );
};

export default Header;
