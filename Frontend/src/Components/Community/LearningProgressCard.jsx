// export default LearningProgressCard;
import React, { useState } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Tag,
  Tooltip,
  Progress,
  Dropdown,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import {
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  AimOutlined,
  BookOutlined,
  PlusOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import LearningProgressService from "../../Services/LearningProgressService";

const { Title, Text, Paragraph } = Typography;

// Updated theme colors (vibrant gradient palette)
const themeColors = {
  primary: "#5E35B1", // Deep purple
  secondary: "#3949AB", // Rich indigo
  accent: "#00ACC1", // Bright teal
  background: "#F5F7FA", // Light gray-blue
  surface: "#edfafd", // Soft lavender
  cardBg: "#d5f1fc", // White
  textPrimary: "#1A237E", // Dark navy
  textSecondary: "#546E7A", // Muted slate
  border: "rgba(0, 0, 0, 0.08)",
  hover: "#7E57C2", // Lighter purple
  danger: "#E53935", // Classic red
  success: "#43A047", // Earthy green
  gradient: "linear-gradient(135deg, #5E35B1 0%, #00ACC1 50%)", // Purple-to-teal
  progressStart: "#d9f6ff", // Gradient start
  progressEnd: "#00ACC1", // Gradient end
};

const LearningProgressCard = ({ plan }) => {
  const snap = useSnapshot(state);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const progressPercentage = plan.completedItems
    ? Math.round((plan.completedItems / plan.totalItems) * 100)
    : 25;

  const deletePlan = async () => {
    try {
      setDeleteLoading(true);
      await LearningProgressService.deleteLearningProgress(plan.id);
      state.LearningProgresss =
        await LearningProgressService.getAllLearningProgresss();
    } catch (error) {
      console.error("Failed to delete Learning Progress:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const updateTemplates = [
    { key: "tutorial", text: "Completed Tutorial", icon: <BookOutlined /> },
    { key: "skill", text: "New Skill Learned", icon: <TrophyOutlined /> },
    {
      key: "milestone",
      text: "Reached Milestone",
      icon: <CheckCircleOutlined />,
    },
  ];

  const getStatusTag = () => {
    if (progressPercentage === 100)
      return <Tag color={themeColors.success}>Completed</Tag>;
    if (progressPercentage >= 70) return <Tag color="#3c2efa">Advanced</Tag>;
    if (progressPercentage >= 30)
      return <Tag color={themeColors.primary}>In Progress</Tag>;
    return <Tag color={themeColors.secondary}>Just Started</Tag>;
  };

  return (
    <Card
      hoverable
      style={{
        width: "100%",
        marginBottom: 16,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: isHovered
          ? "0 8px 24px rgba(108, 92, 231, 0.3)"
          : "0 4px 12px rgba(108, 92, 231, 0.15)",
        transition: "all 0.3s ease",
        transform: expanded
          ? "scale(1.01)"
          : isHovered
          ? "scale(1.005)"
          : "scale(1)",
        cursor: "pointer",
        border: "none",
        background: themeColors.gradient,
        position: "relative",
        padding: 2, // This creates the border effect
      }}
      bodyStyle={{
        padding: 0,
        height: "100%",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Full card background with inner white content */}
      <div
        style={{
          background: themeColors.cardBg,
          borderRadius: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header with gradient */}
        <div
          style={{
            padding: "16px 20px",
            background: themeColors.gradient,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 120,
              height: 120,
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
              right: 20,
              bottom: -40,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              zIndex: 1,
              transition: "transform 0.5s ease-in-out",
              transform: isHovered
                ? "scale(1.2) translateX(-10px)"
                : "scale(1)",
            }}
          />

          <Space
            direction="vertical"
            size="small"
            style={{ width: "100%", position: "relative", zIndex: 2 }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Title
                  level={4}
                  style={{
                    color: "white",
                    margin: 0,
                    fontSize: "18px",
                    transition: "letter-spacing 0.3s ease",
                    letterSpacing: isHovered ? "0.02em" : "0",
                  }}
                >
                  {plan.planName}
                </Title>
              </Col>
              <Col>
                <Space>
                  {getStatusTag()}
                  <Tag
                    color="rgba(255,255,255,0.2)"
                    style={{
                      borderRadius: 8,
                      opacity: 0.95,
                      fontSize: "12px",
                      padding: "1px 10px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                      background: `linear-gradient(135deg, #00629b, #024c63)`,
                    }}
                  >
                    {plan.category || "Learning Plan"}
                  </Tag>
                </Space>
              </Col>
            </Row>

            <Row style={{ marginTop: 8 }} align="middle">
              <Col span={24}>
                <Progress
                  percent={progressPercentage}
                  size="small"
                  status={progressPercentage === 100 ? "success" : "active"}
                  strokeColor={{
                    from: themeColors.progressStart,
                    to: themeColors.progressEnd,
                  }}
                  style={{
                    marginBottom: 0,
                    lineHeight: 1,
                  }}
                  trailColor="rgba(255,255,255,0.3)"
                />
              </Col>
            </Row>
          </Space>
        </div>

        {/* Content area */}
        <div
          style={{
            padding: expanded ? "16px 20px" : "12px 20px",
            background: themeColors.cardBg,
            transition: "max-height 0.4s ease, padding 0.3s ease",
            maxHeight: expanded ? "800px" : "200px",
            overflow: expanded ? "visible" : "hidden",
            flex: 1,
          }}
        >
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <Row gutter={16} align="top">
                <Col>
                  <Tooltip title="Last Updated">
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {plan.lastUpdated || "2 days ago"}
                    </Text>
                  </Tooltip>
                </Col>
              </Row>
            </div>

            {!expanded && (
              <Row gutter={[8, 8]}>
                <Col>
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{
                      fontSize: 12,
                      borderRadius: 8,
                      // // background: "rgba(255,255,255,0.25)",
                      // border: "1px solid rgba(255,255,255,0.4)",
                      // color: themeColors.textPrimary,
                      color: "white",
                      background: `linear-gradient(135deg, #31dd7e, #008026)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(true);
                      setShowUpdateForm(true);
                    }}
                  >
                    Add Progress
                  </Button>
                </Col>
                <Col>
                  <Button
                    size="small"
                    type="text"
                    icon={<InfoCircleOutlined />}
                    style={{
                      fontSize: 12,
                      // color: themeColors.textPrimary,
                      color: "white",
                      background: `linear-gradient(135deg, #319edd, #024c63)`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                  >
                    {expanded ? "Show Less" : "Details"}
                  </Button>
                </Col>
              </Row>
            )}

            {/* Expanded content */}
            {expanded && (
              <>
                <Divider
                  style={{
                    margin: "4px 0 16px",
                    borderColor: themeColors.border,
                  }}
                />

                {/* Description */}
                <div
                  style={{
                    background: themeColors.surface,
                    borderRadius: 12,
                    padding: "16px",
                    backdropFilter: "blur(5px)",
                    border: `2px solid ${themeColors.primary}`, // Using your theme's primary color
                    //boxShadow: `0 0 0 1px ${themeColors.primary} inset` // Optional inner glow
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 14,
                      color: themeColors.textPrimary,
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <InfoCircleOutlined style={{ marginRight: 6 }} />
                    Description
                  </Text>
                  <Paragraph
                    ellipsis={{ rows: expanded ? 5 : 2, expandable: false }}
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      color: themeColors.textPrimary,
                      lineHeight: "1.5",
                      marginBottom: 0,
                    }}
                  >
                    {plan.description}
                  </Paragraph>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px", // space between the two cards
                    flexWrap: "wrap", // allows wrapping on small screens
                  }}
                >
                  {/* Tutorials (Left) */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px", // ensures it doesn't shrink too small
                      background: themeColors.surface,
                      borderRadius: 12,
                      padding: "16px",
                      backdropFilter: "blur(5px)",
                      border: `2px solid ${themeColors.primary}`,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 14,

                        color: themeColors.textPrimary,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <BookOutlined style={{ marginRight: 6 }} />
                      Tutorials
                    </Text>
                    <Paragraph
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: themeColors.textPrimary,
                        lineHeight: "1.5",
                        marginBottom: 0,
                      }}
                      ellipsis={{ rows: 3, expandable: false }}
                    >
                      {plan.goal ||
                        "Your learning tutorials and resources will appear here."}
                    </Paragraph>
                  </div>

                  {/* New Skills Learned (Right) */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      background: themeColors.surface,
                      borderRadius: 12,
                      padding: "16px",
                      backdropFilter: "blur(5px)",
                      border: `2px solid ${themeColors.primary}`,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        color: themeColors.textPrimary,
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <AimOutlined style={{ marginRight: 6 }} />
                      New Skills Learned
                    </Text>
                    <Row gutter={[8, 8]}>
                      {(plan.routines ? plan.routines.split(",") : []).map(
                        (skill, index) => (
                          <Col key={index}>
                            <Tag
                              color={
                                index % 3 === 0
                                  ? "rgba(255, 255, 255, 0.25)"
                                  : index % 3 === 1
                                  ? "rgba(255, 255, 255, 0.3)"
                                  : "rgba(255, 255, 255, 0.35)"
                              }
                              style={{
                                borderRadius: 20,
                                padding: "4px 12px",
                                fontSize: 12,
                                border: "none",
                                color: themeColors.textPrimary,
                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                                transition:
                                  "transform 0.2s ease, box-shadow 0.2s ease",
                                transform: isHovered
                                  ? "translateY(-1px)"
                                  : "translateY(0)",
                                backdropFilter: "blur(5px)",
                                background: " #b6e4ff",
                              }}
                            >
                              {skill.trim()}
                            </Tag>
                          </Col>
                        )
                      )}
                    </Row>
                  </div>
                </div>

                {/* Update form */}
                {showUpdateForm && (
                  <div
                    style={{
                      padding: "16px",
                      background: themeColors.surface,
                      borderRadius: 12,
                      backdropFilter: "blur(5px)",
                      marginTop: 16,
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        color: themeColors.textPrimary,
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      Add Learning Progress Update
                    </Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      {updateTemplates.map((template) => (
                        <Col key={template.key}>
                          <Button
                            icon={template.icon}
                            style={{
                              borderRadius: 8,
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center",
                              background: "rgba(255,255,255,0.2)",
                              border: "1px solid rgba(255,255,255,0.3)",
                              color: themeColors.textPrimary,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open appropriate update form
                              console.log(`Selected template: ${template.key}`);
                            }}
                          >
                            {template.text}
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                <Divider
                  style={{ margin: "16px 0", borderColor: themeColors.border }}
                />

                {/* Action buttons */}
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space>
                      <Button
                        size="middle"
                        icon={
                          showUpdateForm ? (
                            <InfoCircleOutlined />
                          ) : (
                            <PlusOutlined />
                          )
                        }
                        type={showUpdateForm ? "text" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUpdateForm(!showUpdateForm);
                        }}
                        style={{
                          fontSize: 12,
                          borderRadius: 8,
                          // background: showUpdateForm ? "transparent" : "rgba(255,255,255,0.25)",
                          // border: showUpdateForm ? "none" : "1px solid rgba(255,255,255,0.4)",
                          color: "white",
                          background: `linear-gradient(135deg, #437183, #2f6dc9)`,
                          // color: themeColors.textPrimary,
                          display: "flex",
                          alignItems: "center",
                          boxShadow:
                            isHovered && !showUpdateForm
                              ? "0 4px 12px rgba(0,0,0,0.15)"
                              : "none",
                        }}
                      >
                        {showUpdateForm ? "Cancel Update" : "Add Progress"}
                      </Button>
                      <Button
                        size="middle"
                        icon={<ShareAltOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                        }}
                        style={{
                          fontSize: 12,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.15)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          color: themeColors.textPrimary,
                          display: "flex",
                          alignItems: "center",
                          color: "white",
                          background: `linear-gradient(135deg, #6b1bff, #2d0081)`,
                        }}
                      >
                        Share Progress
                      </Button>
                    </Space>
                  </Col>

                  {snap.currentUser?.uid === plan.userId && (
                    <Col>
                      <Space>
                        <Button
                          size="middle"
                          onClick={(e) => {
                            e.stopPropagation();
                            state.selectedLearningProgress = plan;
                            state.editLearningProgressOpened = true;
                          }}
                          type="primary"
                          icon={<EditOutlined />}
                          style={{
                            background: "rgba(255,255,255,0.25)",
                            borderColor: "rgba(255,255,255,0.4)",
                            borderRadius: 8,
                            // color: themeColors.textPrimary,
                            transition: "all 0.2s",
                            boxShadow: isHovered
                              ? "0 4px 12px rgba(0,0,0,0.15)"
                              : "none",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            color: "white",
                            background: `linear-gradient(135deg, #237da1, #08367a)`,
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="middle"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlan();
                          }}
                          loading={deleteLoading}
                          danger
                          type="primary"
                          icon={<DeleteOutlined />}
                          style={{
                            borderRadius: 8,
                            background: `linear-gradient(135deg, #ff3c3c, #8f0000)`,
                            // borderColor: themeColors.danger,
                            transition: "all 0.2s",
                            // boxShadow: isHovered ? "0 4px 12px rgba(229, 57, 53, 0.3)" : "none",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Delete
                        </Button>
                      </Space>
                    </Col>
                  )}
                </Row>
              </>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default LearningProgressCard;
