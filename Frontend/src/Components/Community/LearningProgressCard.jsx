import React, { useState } from "react";
import { Card, Button, Row, Col, Typography, Space, Divider, Tag, Tooltip, Progress, Dropdown } from "antd";
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
  TrophyOutlined
} from "@ant-design/icons";
import LearningProgressService from "../../Services/LearningProgressService";

const { Title, Text, Paragraph } = Typography;

// Theme colors
const themeColors = {
  primary: "#FF6B35", // Bright and inviting orange
  secondary: "#FF8F1C", // Softer tangerine for a modern touch
  accent: "#FF4500", // Fresh red-orange for highlights
  background: "#FFF5E6", // Light orangeish-white for a clean look
  surface: "#FFF0D9", // Soft light orange for surfaces
  cardBg: "#FFFFFF", // White background for cards
  textPrimary: "#1E3A5F", // Deep navy for readability
  textSecondary: "#5A7184", // Muted blue-gray for secondary text
  border: "rgba(0, 0, 0, 0.12)", // Subtle neutral border
  hover: "#FF5733", // Slightly darker orange for hover effects
  danger: "#FF4D4F", // Friendly red for warnings
  success: "#28A745", // Balanced green for success messages
  gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8F1C 100%)", // Light, engaging orange gradient
};

const LearningProgressCard = ({ plan }) => {
  const snap = useSnapshot(state);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  
  // Calculate progress percentage based on completed items or default value
  const progressPercentage = plan.completedItems ? 
    Math.round((plan.completedItems / plan.totalItems) * 100) : 25; // Example default
  
  const deletePlan = async () => {
    try {
      setDeleteLoading(true);
      await LearningProgressService.deleteLearningProgress(plan.id);
      state.LearningProgresss = await LearningProgressService.getAllLearningProgresss();
    } catch (error) {
      console.error("Failed to delete Learning Progress:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const updateTemplates = [
    { key: 'tutorial', text: 'Completed Tutorial', icon: <BookOutlined /> },
    { key: 'skill', text: 'New Skill Learned', icon: <TrophyOutlined /> },
    { key: 'milestone', text: 'Reached Milestone', icon: <CheckCircleOutlined /> }
  ];

  const getStatusTag = () => {
    if (progressPercentage === 100) return <Tag color={themeColors.success}>Completed</Tag>;
    if (progressPercentage >= 70) return <Tag color="#fa8c16">Advanced</Tag>;
    if (progressPercentage >= 30) return <Tag color={themeColors.primary}>In Progress</Tag>;
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
          ? "0 8px 24px rgba(90, 155, 255, 0.2)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
        transform: expanded ? "scale(1.01)" : isHovered ? "scale(1.005)" : "scale(1)",
        cursor: "pointer",
        border: `1px solid ${isHovered ? themeColors.secondary : themeColors.border}`,
        background: themeColors.cardBg
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bodyStyle={{ padding: 0 }}
    >
      <div 
        style={{
          padding: "16px 20px",
          background: themeColors.gradient,
          color: "white",
          position: "relative",
          overflow: "hidden"
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
            transform: isHovered ? "scale(1.2)" : "scale(1)"
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
            transform: isHovered ? "scale(1.2) translateX(-10px)" : "scale(1)"
          }} 
        />
        
        <Space direction="vertical" size="small" style={{ width: "100%", position: "relative", zIndex: 2 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ 
                color: "white", 
                margin: 0,
                fontSize: "18px",
                transition: "letter-spacing 0.3s ease",
                letterSpacing: isHovered ? "0.02em" : "0"
              }}>
                {plan.planName}
              </Title>
            </Col>
            <Col>
              <Space>
                {getStatusTag()}
                <Tag color={themeColors.accent} style={{ 
                  borderRadius: 8, 
                  opacity: 0.95,
                  fontSize: "12px",
                  padding: "1px 10px",
                  border: "none"
                }}>
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
                  from: themeColors.secondary,
                  to: themeColors.accent
                }}
                style={{ 
                  marginBottom: 0,
                  lineHeight: 1
                }}
              />
            </Col>
          </Row>
        </Space>
      </div>

      <div style={{ 
        padding: expanded ? "16px 20px" : "12px 20px", 
        background: themeColors.background,
        transition: "max-height 0.4s ease, padding 0.3s ease",
        maxHeight: expanded ? "800px" : "200px",
        overflow: expanded ? "visible" : "hidden"
      }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <div>
            <Row gutter={16} align="top">
              <Col flex="1">
                <Text strong style={{ 
                  fontSize: 14, 
                  color: themeColors.primary, 
                  display: "flex", 
                  alignItems: "center" 
                }}>
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
                    marginBottom: 0
                  }}
                >
                  {plan.description}
                </Paragraph>
              </Col>
              
              <Col>
                <Tooltip title="Last Updated">
                  <Text type="secondary" style={{ fontSize: 12, display: "flex", alignItems: "center" }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {plan.lastUpdated || "2 days ago"}
                  </Text>
                </Tooltip>
              </Col>
            </Row>
          </div>
          
          {!expanded && (
            <Row gutter={[8, 8]} style={{ marginTop: 12 }}>
              <Col>
                <Button 
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ 
                    fontSize: 12,
                    borderRadius: 8,
                    background: themeColors.primary,
                    border: "none",
                    boxShadow: "none"
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
                    color: themeColors.secondary
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
          
          {expanded && (
            <>
              <Divider style={{ margin: "12px 0", borderColor: themeColors.border }} />
              
              <div>
                <Text strong style={{ 
                  fontSize: 14, 
                  color: themeColors.primary, 
                  display: "flex", 
                  alignItems: "center" 
                }}>
                  <BookOutlined style={{ marginRight: 6 }} />
                  Tutorials
                </Text>
                <Paragraph 
                  style={{ 
                    marginTop: 6, 
                    fontSize: 13,
                    color: themeColors.textPrimary,
                    lineHeight: "1.5"
                  }}
                  ellipsis={{ rows: 3, expandable: false }}
                >
                  {plan.goal || "Your learning tutorials and resources will appear here."}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: "12px 0", borderColor: themeColors.border }} />
              
              <div>
                <Text strong style={{ 
                  fontSize: 14, 
                  color: themeColors.primary, 
                  display: "flex", 
                  alignItems: "center",
                  marginBottom: 6
                }}>
                  <AimOutlined style={{ marginRight: 6 }} />
                  New Skills Learned
                </Text>
                <Row gutter={[8, 8]}>
                  {(plan.routines ? plan.routines.split(',') : []).map((skill, index) => (
                    <Col key={index}>
                      <Tag 
                        color={
                          index % 4 === 0 ? themeColors.primary : 
                          index % 4 === 1 ? themeColors.secondary : 
                          index % 4 === 2 ? themeColors.accent : 
                          "#69c0ff"
                        } 
                        style={{ 
                          borderRadius: 20, 
                          padding: "3px 10px", 
                          fontSize: 12,
                          border: "none",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                        }}
                      >
                        {skill.trim()}
                      </Tag>
                    </Col>
                  ))}
                </Row>
              </div>
              
              {showUpdateForm && (
                <>
                  <Divider style={{ margin: "12px 0", borderColor: themeColors.border }} />
                  <div style={{ 
                    padding: "10px", 
                    background: themeColors.surface,
                    borderRadius: 8
                  }}>
                    <Text strong style={{ fontSize: 14, color: themeColors.primary }}>
                      Add Learning Progress Update
                    </Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      {updateTemplates.map(template => (
                        <Col key={template.key}>
                          <Button
                            icon={template.icon}
                            style={{ 
                              borderRadius: 8,
                              fontSize: 12,
                              display: "flex",
                              alignItems: "center"
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
                </>
              )}
              
              <Divider style={{ margin: "12px 0", borderColor: themeColors.border }} />
              
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Button
                      size="small"
                      icon={showUpdateForm ? <InfoCircleOutlined /> : <PlusOutlined />}
                      type={showUpdateForm ? "text" : "primary"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUpdateForm(!showUpdateForm);
                      }}
                      style={{ 
                        fontSize: 12,
                        borderRadius: 8,
                        background: showUpdateForm ? "transparent" : themeColors.primary,
                        transition: "all 0.2s"
                      }}
                    >
                      {showUpdateForm ? "Cancel Update" : "Add Progress"}
                    </Button>
                    <Button
                      size="small"
                      icon={<ShareAltOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Share functionality
                      }}
                      style={{ 
                        fontSize: 12,
                        borderRadius: 8
                      }}
                    >
                      Share Progress
                    </Button>
                  </Space>
                </Col>
                
                {snap.currentUser?.uid === plan.userId && (
                  <Col>
                    <Space>
                      <Tooltip title="Edit">
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            state.selectedLearningProgress = plan;
                            state.editLearningProgressOpened = true;
                          }}
                          type="primary"
                          icon={<EditOutlined />}
                          style={{ 
                            background: themeColors.primary, 
                            borderColor: themeColors.primary,
                            borderRadius: 8,
                            transition: "all 0.2s",
                            boxShadow: isHovered ? "0 4px 12px rgba(0, 123, 255, 0.3)" : "none",
                            fontSize: 12
                          }}
                        >
                          Edit
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          size="small"
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
                            background: themeColors.danger,
                            borderColor: themeColors.danger,
                            transition: "all 0.2s",
                            boxShadow: isHovered ? "0 4px 12px rgba(255, 77, 79, 0.3)" : "none",
                            fontSize: 12
                          }}
                        >
                          Delete
                        </Button>
                      </Tooltip>
                    </Space>
                  </Col>
                )}
              </Row>
            </>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default LearningProgressCard;