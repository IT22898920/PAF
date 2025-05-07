import React, { useState } from "react";
import {
  Modal,
  Upload,
  Input,
  Button,
  DatePicker,
  message,
  Select,
  Form,
  Slider,
  Typography,
  Card,
  Divider,
  Row,
  Col,
  Spin
} from "antd";
import { 
  UploadOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  CalendarOutlined,
  EditOutlined,
  TagOutlined,
  FileTextOutlined,
  PictureOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import StoryService from "../../Services/StoryService";
import moment from "moment";

// Enhanced professional blue color palette
const themeColors = {
  primary: "#1E5EFA", // Vibrant blue primary color
  primaryLight: "#E7EFFF", // Light blue for backgrounds
  primaryDark: "#0B3BC2", // Darker blue for hover states and emphasis
  secondary: "#2E7CF6", // Secondary blue for accents
  accent: "#00D2FF", // Cyan accent for highlights
  background: "#F5F8FF", // Very light blue tinted background
  surface: "#FFFFFF", // White surface
  cardBg: "#FFFFFF", // White card background
  textPrimary: "#172B4D", // Deep blue-gray for primary text
  textSecondary: "#5E6C84", // Medium blue-gray for secondary text
  border: "#DFE7F7", // Light blue-gray border
  hover: "#0B3BC2", // Darker blue for hover
  danger: "#FF3B5E", // Modern red for warnings/errors
  success: "#00C292", // Teal green for success
  gradient: "linear-gradient(135deg, #1E5EFA 0%, #00D2FF 100%)", // Blue gradient
  gradientHover: "linear-gradient(135deg, #0B3BC2 0%, #00AADD 100%)", // Darker gradient for hover
  shadow: "0 8px 24px rgba(30, 94, 250, 0.12)", // Soft blue shadow
  subtleShadow: "0 4px 12px rgba(30, 94, 250, 0.07)", // More subtle shadow
};

const uploader = new UploadFileService();
const { Option } = Select;
const { Text, Title } = Typography;

const CreateStoryModal = () => {
  const snap = useSnapshot(state);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timestamp: null,
    exerciseType: "",
    timeDuration: 30,
    intensity: "",
    image: ""
  });

  // Duration markers for slider
  const durationMarks = {
    0: '0',
    15: '15',
    30: '30',
    45: '45',
    60: '60',
    90: '90',
    120: '120'
  };

  // Function to get intensity color based on duration
  const getIntensityColor = (duration) => {
    if (duration < 15) return themeColors.success;     // Green - Easy
    if (duration < 30) return themeColors.secondary;   // Secondary blue - Moderate
    if (duration < 60) return themeColors.accent;      // Cyan - Intense
    return themeColors.danger;                         // Red - Very Intense
  };

  const handleCreateWorkoutStory = async () => {
    try {
      setLoading(true);
      const body = {
        ...formData,
        image: uploadedImage,
        userId: snap.currentUser?.uid,
      };
      
      await StoryService.createWorkoutStory(body);
      state.storyCards = await StoryService.getAllWorkoutStories();
      message.success({
        content: "Learning Plan created successfully",
        style: {
          borderRadius: '8px',
          boxShadow: themeColors.shadow
        }
      });
      
      // Reset form and modal
      form.resetFields();
      setUploadedImage(null);
      state.createWorkoutStatusModalOpened = false;
    } catch (error) {
      message.error({
        content: "Error creating Learning Plan",
        style: {
          borderRadius: '8px',
          boxShadow: themeColors.shadow
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      setImageUploading(true);
      try {
        const url = await uploader.uploadFile(
          info.fileList[0].originFileObj,
          "workoutStories"
        );
        setUploadedImage(url);
      } catch (error) {
        console.error("Error uploading image:", error);
        message.error({
          content: "Failed to upload image",
          style: {
            borderRadius: '8px',
            boxShadow: themeColors.shadow
          }
        });
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      timestamp: date,
    });
  };

  const handleIntensityChange = (value) => {
    setFormData({
      ...formData,
      intensity: value,
    });
  };

  // Get intensity icon and color
  const getIntensityIconAndColor = (intensity) => {
    switch(intensity) {
      case "No Efforts":
        return { color: themeColors.success, intensity: 1 };
      case "Mid Efforts":
        return { color: themeColors.secondary, intensity: 2 };
      case "Moderate Efforts":
        return { color: themeColors.accent, intensity: 3 };
      case "Severe Efforts":
        return { color: themeColors.danger, intensity: 4 };
      case "Maximal Efforts":
        return { color: '#6B38FB', intensity: 5 }; // Purple for max
      default:
        return { color: themeColors.border, intensity: 0 };
    }
  };

  const renderIntensityIcons = (intensity) => {
    const { color, intensity: level } = getIntensityIconAndColor(intensity);
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <FireOutlined 
            key={i}
            style={{ 
              color: i <= level ? color : themeColors.border,
              marginRight: '4px',
              fontSize: i === level ? '18px' : '14px',
              transition: 'all 0.3s'
            }} 
          />
        ))}
        <span style={{ marginLeft: '8px', color, fontWeight: 500 }}>{intensity}</span>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '16px 0 8px'
        }}>
          <div style={{
            width: 6,
            height: 28,
            background: themeColors.gradient,
            marginRight: 16,
            borderRadius: 3
          }} />
          <Title level={4} style={{ 
            margin: 0, 
            color: themeColors.textPrimary,
            fontWeight: 600
          }}>
            Create Learning Plan
          </Title>
        </div>
      }
      open={snap.createWorkoutStatusModalOpened}
      onCancel={() => {
        state.createWorkoutStatusModalOpened = false;
      }}
      width={800}
      bodyStyle={{ 
        padding: '24px', 
        backgroundColor: themeColors.background,
        borderRadius: '16px'
      }}
      footer={null}
      centered
      style={{ 
        overflow: 'hidden',
        '--antd-wave-shadow-color': themeColors.primary 
      }}
      className="learning-plan-modal"
    >
      <Card 
        bordered={false} 
        style={{ 
          background: themeColors.cardBg,
          borderRadius: '16px',
          boxShadow: themeColors.subtleShadow,
          maxHeight: '75vh',
          overflow: 'auto'
        }}
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px' 
          }}
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col span={24}>
              {uploadedImage ? (
                <div style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden',
                  boxShadow: themeColors.subtleShadow,
                  marginBottom: '20px',
                  position: 'relative',
                  height: '240px'
                }}>
                  <img
                    style={{ 
                      width: "100%", 
                      height: "100%",
                      objectFit: 'cover'
                    }}
                    src={uploadedImage}
                    alt="Learning Plan"
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '50px 20px 20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircleOutlined style={{ color: '#ffffff', fontSize: '18px' }} />
                      <Text style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                        Image Ready
                      </Text>
                    </div>
                    <Upload
                      accept="image/*"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        type="primary"
                        ghost
                        style={{ 
                          borderColor: 'white', 
                          color: 'white',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Change Image
                      </Button>
                    </Upload>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginBottom: '24px',
                  border: `2px dashed ${themeColors.border}`,
                  borderRadius: '16px',
                  padding: '40px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: themeColors.primaryLight,
                  height: '240px',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  ':hover': {
                    borderColor: themeColors.primary
                  }
                }}>
                  {imageUploading ? (
                    <Spin 
                      size="large" 
                      tip="Uploading image..." 
                      style={{
                        color: themeColors.primary
                      }}
                    />
                  ) : (
                    <Upload
                      accept="image/*"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <PictureOutlined style={{ 
                          fontSize: '42px', 
                          color: themeColors.primary, 
                          marginBottom: '16px' 
                        }} />
                        <div>
                          <Text strong style={{ 
                            fontSize: '16px', 
                            color: themeColors.primary,
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            Upload Plan Image
                          </Text>
                          <Text type="secondary" style={{ fontSize: '14px' }}>
                            Recommend 16:9 ratio for best display
                          </Text>
                        </div>
                        <Button 
                          type="primary" 
                          style={{
                            marginTop: '16px',
                            background: themeColors.primary,
                            borderColor: 'transparent',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0 20px'
                          }}
                          icon={<UploadOutlined />}
                        >
                          Select File
                        </Button>
                      </div>
                    </Upload>
                  )}
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={16}>
              <Form.Item 
                label={
                  <span className="form-label">
                    <EditOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                    Plan Title
                  </span>
                } 
                name="title" 
                rules={[{ required: true, message: 'Please enter a title for your learning plan' }]}
              >
                <Input
                  placeholder="Enter a memorable title for your plan"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{ 
                    borderRadius: '10px',
                    padding: '12px 16px',
                    height: 'auto',
                    borderColor: themeColors.border,
                    boxShadow: 'none',
                    transition: 'all 0.3s'
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item 
                label={
                  <span className="form-label">
                    <CalendarOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                    Start Date
                  </span>
                } 
                name="timestamp"
              >
                <DatePicker
                  placeholder="When will you start?"
                  style={{ 
                    width: "100%", 
                    borderRadius: '10px',
                    padding: '12px 16px',
                    height: 'auto',
                    borderColor: themeColors.border
                  }}
                  value={formData.timestamp}
                  onChange={handleDateChange}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label={
              <span className="form-label">
                <TagOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                Exercise Type
              </span>
            } 
            name="exerciseType"
          >
            <Input
              placeholder="What type of exercise? (e.g., Running, Yoga, Strength Training)"
              name="exerciseType"
              value={formData.exerciseType}
              onChange={handleInputChange}
              style={{ 
                borderRadius: '10px',
                padding: '12px 16px',
                height: 'auto',
                borderColor: themeColors.border
              }}
            />
          </Form.Item>
          
          <Divider style={{ 
            margin: '4px 0 24px', 
            background: themeColors.border 
          }} />
          
          <Form.Item 
            label={
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                width: '100%',
                marginBottom: '12px'
              }}>
                <span className="form-label">
                  <ClockCircleOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Training Duration
                </span>
                <Text 
                  strong 
                  style={{ 
                    color: getIntensityColor(formData.timeDuration),
                    fontSize: '16px',
                    background: `${getIntensityColor(formData.timeDuration)}15`,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: '14px' }} />
                  {formData.timeDuration} minutes
                </Text>
              </div>
            }
            name="timeDuration"
            style={{ marginBottom: 0 }}
          >
            <div style={{ 
              backgroundColor: themeColors.primaryLight,
              padding: '24px 20px',
              borderRadius: '12px',
              border: `1px solid ${themeColors.border}`,
            }}>
              <Slider
                min={0}
                max={120}
                step={15}
                value={formData.timeDuration}
                marks={durationMarks}
                tooltip={{ formatter: value => `${value} minutes` }}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    timeDuration: value,
                  });
                }}
                trackStyle={{ backgroundColor: getIntensityColor(formData.timeDuration) }}
                handleStyle={{ 
                  borderColor: getIntensityColor(formData.timeDuration),
                  boxShadow: `0 0 0 6px ${getIntensityColor(formData.timeDuration)}30`,
                  width: '20px',
                  height: '20px',
                  marginTop: '-8px'
                }}
                railStyle={{ 
                  backgroundColor: '#E0E8F7',
                  height: '6px'
                }}
              />
            </div>
          </Form.Item>

          <Form.Item 
            label={
              <span className="form-label">
                <FireOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                Intensity Level
              </span>
            } 
            name="intensity"
          >
            <Select
              placeholder="Select intensity level"
              style={{ 
                width: "100%", 
                borderRadius: '10px'
              }}
              value={formData.intensity}
              onChange={handleIntensityChange}
              suffixIcon={<FireOutlined style={{ color: themeColors.primary }} />}
              dropdownStyle={{ borderRadius: '10px' }}
              size="large"
            >
              <Option value="No Efforts">
                {renderIntensityIcons("No Efforts")}
              </Option>
              <Option value="Mid Efforts">
                {renderIntensityIcons("Mid Efforts")}
              </Option>
              <Option value="Moderate Efforts">
                {renderIntensityIcons("Moderate Efforts")}
              </Option>
              <Option value="Severe Efforts">
                {renderIntensityIcons("Severe Efforts")}
              </Option>
              <Option value="Maximal Efforts">
                {renderIntensityIcons("Maximal Efforts")}
              </Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label={
              <span className="form-label">
                <FileTextOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                Description
              </span>
            } 
            name="description"
          >
            <Input.TextArea
              placeholder="Add some details about this learning plan... What are your goals? What will you learn?"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              style={{ 
                borderRadius: '10px',
                padding: '14px 16px',
                borderColor: themeColors.border
              }}
            />
          </Form.Item>
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${themeColors.border}`
            }}
          >
            <Button 
              key="cancel" 
              onClick={() => (state.createWorkoutStatusModalOpened = false)}
              style={{
                borderRadius: '10px',
                padding: '10px 22px',
                height: 'auto',
                fontSize: '15px',
                borderColor: themeColors.border,
                color: themeColors.textSecondary
              }}
            >
              Cancel
            </Button>
            <Button
              loading={loading}
              key="create"
              type="primary"
              onClick={handleCreateWorkoutStory}
              style={{
                background: themeColors.gradient,
                borderColor: 'transparent',
                borderRadius: '10px',
                boxShadow: themeColors.shadow,
                padding: '10px 26px',
                height: 'auto',
                fontSize: '15px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              icon={<EditOutlined />}
              className="create-button"
            >
              Create Learning Plan
            </Button>
          </div>
        </Form>

        <style jsx global>{`
          .form-label {
            font-weight: 600;
            color: ${themeColors.textPrimary};
            font-size: 15px;
            display: flex;
            align-items: center;
          }
          
          .ant-form-item {
            margin-bottom: 26px;
          }
          
          .ant-select-selector {
            padding: 8px 12px !important;
            height: auto !important;
            border-radius: 10px !important;
            border-color: ${themeColors.border} !important;
          }
          
          .ant-select-selection-item {
            display: flex;
            align-items: center;
          }
          
          .ant-modal-content {
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          }
          
          .ant-slider-mark-text {
            font-size: 12px;
            color: ${themeColors.textSecondary};
            font-weight: 500;
          }
          
          .ant-slider:hover .ant-slider-track {
            background-color: ${themeColors.primary};
          }
          
          .ant-input:focus, 
          .ant-input-focused,
          .ant-select-focused .ant-select-selector,
          .ant-picker-focused {
            border-color: ${themeColors.primary} !important;
            box-shadow: 0 0 0 2px ${themeColors.primary}20 !important;
          }
          
          .create-button:hover {
            background: ${themeColors.gradientHover} !important;
            transform: translateY(-1px);
            box-shadow: ${themeColors.shadow}, 0 6px 20px rgba(30, 94, 250, 0.2) !important;
          }
          
          .learning-plan-modal .ant-modal-header {
            border-bottom: 1px solid ${themeColors.border};
            padding-bottom: 16px;
          }
          
          .learning-plan-modal .ant-modal-close {
            color: ${themeColors.textSecondary};
          }
          
          .learning-plan-modal .ant-modal-close:hover {
            color: ${themeColors.primary};
          }
          
          /* Animations */
          .ant-btn, .ant-input, .ant-select, .ant-picker, .ant-slider-handle {
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
          }
        `}</style>
      </Card>
    </Modal>
  );
};

export default CreateStoryModal;