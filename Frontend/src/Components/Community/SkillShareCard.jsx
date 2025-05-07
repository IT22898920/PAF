import React, { useState, useEffect } from "react";
import {
  Card,
  Carousel,
  Button,
  Row,
  Col,
  Typography,
  Modal,
  Space,
  Avatar,
  Tooltip,
  Badge,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import {
  EditOutlined,
  DeleteOutlined,
  ExpandOutlined,
  ShareAltOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import SkillShareService from "../../Services/SkillShareService";

const { Title, Text, Paragraph } = Typography;

// Enhanced premium color palette
const themeColors = {
  // Primary colors
  primary: "#4361EE",
  primaryDark: "#3A56D4",
  primaryLight: "#EEF2FF",
  primaryGlow: "rgba(67, 97, 238, 0.15)",

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
  borderActive: "rgba(67, 97, 238, 0.5)",
  shadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  shadowHover: "0 10px 20px rgba(67, 97, 238, 0.15)",

  // Gradients
  primaryGradient: "linear-gradient(135deg, #4361EE 0%, #3A56D4 100%)",
  accentGradient: "linear-gradient(135deg, #7209B7 0%, #4361EE 100%)",
  overlayGradient:
    "linear-gradient(rgba(30, 41, 59, 0), rgba(30, 41, 59, 0.8))",

  // Status colors
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const SkillShareCard = ({ plan }) => {
  const snap = useSnapshot(state);
  const [deleteLoading, setIsDeleteLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMedia, setPreviewMedia] = useState({ url: "", type: "image" });
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 50) + 5
  );
  const [commentCount, setCommentCount] = useState(
    Math.floor(Math.random() * 20)
  );
  const [isHovered, setIsHovered] = useState(false);
  const [author, setAuthor] = useState(null);

  // Fetch author data
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        if (snap.users) {
          const user = snap.users.find((u) => u.userId === plan.userId);
          if (user) {
            setAuthor(user);
          }
        }
      } catch (error) {
        console.error("Error fetching author data:", error);
      }
    };
    fetchAuthor();
  }, [plan.userId, snap.users]);

  const deletePlan = async () => {
    try {
      setIsDeleteLoading(true);
      await SkillShareService.deleteSkillShare(plan.id);
      state.SkillShares = await SkillShareService.getAllSkillShares();
    } catch (error) {
      console.error("Error deleting skill sharing post:", error);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handlePreview = (url, type) => {
    setPreviewMedia({ url, type });
    setPreviewVisible(true);
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString || Date.now());
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const renderMediaItem = (url, type, index) => {
    return type === "image" ? (
      <div
        key={index}
        className="media-container"
        onClick={() => handlePreview(url, type)}
      >
        <img
          src={url}
          alt={`Media ${index + 1}`}
          style={{
            width: "100%",
            height: 320,
            objectFit: "cover",
            borderRadius: "0px",
            cursor: "pointer",
            transition: "transform 0.5s ease",
            transform: isHovered ? "scale(1.02)" : "scale(1)",
          }}
        />
        <div className="media-overlay">
          <div className="overlay-content">
            <ExpandOutlined
              style={{ fontSize: 28, color: "white", marginBottom: 8 }}
            />
            <Text style={{ color: "white", fontSize: 16 }}>
              View Fullscreen
            </Text>
          </div>
        </div>
        <style jsx>{`
          .media-container {
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 320px;
          }
          .media-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              rgba(30, 41, 59, 0),
              rgba(30, 41, 59, 0.75)
            );
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .overlay-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translateY(20px);
            transition: transform 0.3s ease;
          }
          .media-container:hover .media-overlay {
            opacity: 1;
          }
          .media-container:hover .overlay-content {
            transform: translateY(0);
          }
        `}</style>
      </div>
    ) : (
      <div key={index} className="media-container">
        <video
          src={url}
          controls
          style={{
            width: "100%",
            height: 320,
            objectFit: "cover",
            borderRadius: "0px",
            transition: "transform 0.5s ease",
            transform: isHovered ? "scale(1.02)" : "scale(1)",
          }}
        />
        <div className="video-overlay" onClick={() => handlePreview(url, type)}>
          <EyeOutlined
            style={{ fontSize: 28, color: "white", marginBottom: 8 }}
          />
        </div>
        <style jsx>{`
          .media-container {
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 320px;
          }
          .video-overlay {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 50px;
            height: 50px;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
          }
          .media-container:hover .video-overlay {
            opacity: 1;
            transform: scale(1);
          }
          .video-overlay:hover {
            background: rgba(67, 97, 238, 0.7);
            transform: scale(1.1) !important;
          }
        `}</style>
      </div>
    );
  };

  // Get card style based on hover state
  const cardStyle = {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    boxShadow: isHovered ? themeColors.shadowHover : themeColors.shadow,
    border: `1px solid ${
      isHovered ? themeColors.borderActive : themeColors.border
    }`,
    transition: "all 0.3s ease",
    transform: isHovered ? "translateY(-5px)" : "translateY(0)",
    background: themeColors.surface,
  };

  return (
    <>
      <Card
        style={cardStyle}
        bodyStyle={{ padding: 0 }}
        bordered={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Header */}
        <div
          style={{
            background: themeColors.primaryGradient,
            padding: "20px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 150,
              height: 150,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              zIndex: 1,
              transition: "transform 0.5s ease",
              transform: isHovered
                ? "translate(-10px, 10px)"
                : "translate(0, 0)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 50,
              bottom: -60,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              zIndex: 1,
              transition: "transform 0.5s ease",
              transform: isHovered
                ? "translate(10px, -10px)"
                : "translate(0, 0)",
            }}
          />

          <Row
            justify="space-between"
            align="middle"
            style={{ position: "relative", zIndex: 2 }}
          >
            <Col style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "6px 12px",
                  borderRadius: 30,
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
                  SKILL SHARE
                </Text>
              </div>
              <div
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                {getTimeAgo(plan.createdAt)}
              </div>
            </Col>
            <Col>
              <Badge
                count={Math.floor(Math.random() * 100) + 20}
                overflowCount={999}
                style={{ backgroundColor: themeColors.accent }}
              >
                <Tooltip title="Views">
                  <EyeOutlined style={{ color: "white", fontSize: 20 }} />
                </Tooltip>
              </Badge>
            </Col>
          </Row>
        </div>

        {/* Author Info Section */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${themeColors.border}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar
            src={author?.image}
            icon={!author?.image && <UserOutlined />}
            size={48}
            style={{
              border: `2px solid ${themeColors.primary}`,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
            onClick={() => {
              if (author) {
                state.selectedUserProfile = author;
                state.friendProfileModalOpened = true;
              }
            }}
          />
          <div style={{ marginLeft: 16 }}>
            <Title
              level={5}
              style={{ margin: 0, color: themeColors.textPrimary }}
            >
              {author?.username || "Anonymous User"}
            </Title>
            <Text
              style={{
                color: themeColors.textSecondary,
                display: "flex",
                alignItems: "center",
              }}
            >
              <CalendarOutlined style={{ marginRight: 6, fontSize: 12 }} />
              {formatDate(plan.createdAt)}
            </Text>
          </div>
        </div>

        {/* Media Display */}
        <div style={{ padding: 0 }}>
          {plan.mediaUrls && plan.mediaUrls.length > 0 ? (
            <Carousel
              autoplay={false}
              dots={plan.mediaUrls.length > 1}
              dotPosition="bottom"
              style={{ marginBottom: 0 }}
              effect="fade"
            >
              {plan.mediaUrls.map((url, index) =>
                renderMediaItem(
                  url,
                  plan.mediaTypes ? plan.mediaTypes[index] : "image",
                  index
                )
              )}
            </Carousel>
          ) : (
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: themeColors.primaryLight,
                color: themeColors.primary,
                flexDirection: "column",
                padding: "20px",
              }}
            >
              <InfoCircleOutlined style={{ fontSize: 32, marginBottom: 12 }} />
              <Text style={{ fontSize: 16, color: themeColors.textSecondary }}>
                No media available for this skill sharing post
              </Text>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{ padding: "24px", background: themeColors.surface }}>
          <Title
            level={4}
            style={{
              marginTop: 0,
              marginBottom: 16,
              color: themeColors.textPrimary,
              fontSize: 22,
            }}
          >
            {plan.title ||
              "Skill Sharing: " + (plan.skillName || "Untitled Skill")}
          </Title>

          <Paragraph
            style={{
              fontSize: 16,
              marginBottom: 20,
              whiteSpace: "pre-line",
              color: themeColors.textPrimary,
              lineHeight: 1.6,
            }}
          >
            {plan.mealDetails || "No description provided for this skill."}
          </Paragraph>

          {/* Interaction Section */}
          <Row justify="space-between" align="middle" style={{ marginTop: 24 }}>
            <Col>
              <Space size="large">
                <Button
                  type="text"
                  icon={
                    liked ? (
                      <HeartFilled style={{ color: themeColors.danger }} />
                    ) : (
                      <HeartOutlined
                        style={{ color: themeColors.textSecondary }}
                      />
                    )
                  }
                  onClick={handleLike}
                  style={{
                    color: liked
                      ? themeColors.danger
                      : themeColors.textSecondary,
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ marginLeft: 8 }}>{likeCount}</span>
                </Button>
                <Button
                  type="text"
                  icon={
                    <MessageOutlined
                      style={{ color: themeColors.textSecondary }}
                    />
                  }
                  style={{
                    color: themeColors.textSecondary,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginLeft: 8 }}>{commentCount}</span>
                </Button>
                <Tooltip title="Share this skill">
                  <Button
                    type="text"
                    icon={
                      <ShareAltOutlined
                        style={{ color: themeColors.textSecondary }}
                      />
                    }
                    style={{ color: themeColors.textSecondary }}
                  />
                </Tooltip>
              </Space>
            </Col>

            {plan.userId === snap.currentUser?.uid && (
              <Col>
                <Space>
                  <Button
                    onClick={() => {
                      state.seletedSkillShareToUpdate = plan;
                      state.updateSkillShareOpened = true;
                    }}
                    type="primary"
                    icon={<EditOutlined />}
                    style={{
                      background: themeColors.primary,
                      borderColor: themeColors.primary,
                      borderRadius: 8,
                      transition: "all 0.2s ease",
                      boxShadow: `0 4px 12px ${themeColors.primaryGlow}`,
                      "&:hover": {
                        background: themeColors.primaryDark,
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 16px ${themeColors.primaryGlow}`,
                      },
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = themeColors.primaryDark;
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = `0 6px 16px ${themeColors.primaryGlow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = themeColors.primary;
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = `0 4px 12px ${themeColors.primaryGlow}`;
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={deletePlan}
                    loading={deleteLoading}
                    danger
                    icon={<DeleteOutlined />}
                    style={{
                      borderRadius: 8,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                      },
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(239, 68, 68, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              </Col>
            )}
          </Row>
        </div>
      </Card>

      {/* Media Preview Modal */}
      <Modal
        visible={previewVisible}
        title={null}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 16, overflow: "hidden" }}
        closeIcon={
          <Button
            type="text"
            shape="circle"
            icon={<DeleteOutlined />}
            style={{
              color: "white",
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              background: "rgba(0, 0, 0, 0.5)",
              border: "none",
              fontSize: 18,
            }}
          />
        }
      >
        {previewMedia.type === "image" ? (
          <img alt="Preview" src={previewMedia.url} style={{ width: "100%" }} />
        ) : (
          <video
            src={previewMedia.url}
            controls
            style={{ width: "100%" }}
            autoPlay
          />
        )}
      </Modal>
    </>
  );
};

export default SkillShareCard;
