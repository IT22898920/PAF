import React, { useEffect, useState } from "react";
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
  Col
} from "antd";
import { 
  UploadOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  CalendarOutlined,
  EditOutlined,
  TagOutlined
} from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import StoryService from "../../Services/StoryService";
import moment from "moment";

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

const uploader = new UploadFileService();
const { Option } = Select;
const { Text, Title } = Typography;

const UpdateStory = () => {
  const snap = useSnapshot(state);
  const workoutStory = snap.selectedWorkoutStory;
  const userId = snap.currentUser?.id;
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  useEffect(() => {
    if (workoutStory) {
      setFormData({
        title: workoutStory.title || "",
        description: workoutStory.description || "",
        timestamp: workoutStory.timestamp ? moment(workoutStory.timestamp) : null,
        exerciseType: workoutStory.exerciseType || "",
        timeDuration: workoutStory.timeDuration || 30,
        intensity: workoutStory.intensity || "",
        image: workoutStory.image || ""
      });
      
      form.setFieldsValue({
        title: workoutStory.title,
        description: workoutStory.description,
        timestamp: workoutStory.timestamp ? moment(workoutStory.timestamp) : null,
        exerciseType: workoutStory.exerciseType,
        timeDuration: workoutStory.timeDuration || 30,
        intensity: workoutStory.intensity
      });
    }
  }, [workoutStory, form]);

  const handleUpdateStory = async () => {
    try {
      setLoading(true);
      const body = {
        ...formData,
        image: uploadedImage || workoutStory.image,
      };
      
      await StoryService.UpdateStory(workoutStory.id, body);
      state.storyCards = await StoryService.getAllWorkoutStories();
      message.success("Learning Plan updated successfully");
      
      state.workoutStoryOpen = false;
    } catch (error) {
      message.error("Error updating Learning Plan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await StoryService.deleteWorkoutStory(workoutStory.id);
      state.storyCards = await StoryService.getAllWorkoutStories();
      state.workoutStoryOpen = false;
      message.success("Learning Plan deleted successfully");
    } catch (error) {
      message.error("Failed to delete Learning Plan");
    } finally {
      setDeleteLoading(false);
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
    if (duration < 15) return '#52c41a';     // Light green - Easy
    if (duration < 30) return '#1890ff';     // Blue - Moderate
    if (duration < 60) return '#faad14';     // Orange - Intense
    return '#f5222d';                        // Red - Very Intense
  };

  if (userId !== workoutStory?.userId) {
    return (
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 4,
              height: 24,
              background: themeColors.primary,
              marginRight: 12,
              borderRadius: 2
            }} />
            <Title level={4} style={{ margin: 0, color: themeColors.textPrimary }}>
              Learning Plan Details
            </Title>
          </div>
        }
        open={snap.workoutStoryOpen}
        onCancel={() => {
          state.workoutStoryOpen = false;
        }}
        width={500}
        bodyStyle={{ 
          padding: '20px', 
          backgroundColor: themeColors.background,
          borderRadius: '10px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => (state.workoutStoryOpen = false)}
            style={{
              borderRadius: '6px',
            }}
          >
            Close
          </Button>
        ]}
        centered
      >
        <Card 
          bordered={false} 
          style={{ 
            background: themeColors.cardBg,
            borderRadius: '10px',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div style={{ 
            borderRadius: '10px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '16px'
          }}>
            <img 
              src={workoutStory?.image} 
              style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover' 
              }} 
              alt="Learning Plan" 
            />
          </div>
          <Row gutter={[16, 12]}>
            <Col span={16}>
              <div>
                <Text type="secondary">Title</Text>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>{workoutStory?.title}</div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <Text type="secondary">Date</Text>
                <div>{workoutStory?.timestamp ? moment(workoutStory.timestamp).format('YYYY-MM-DD') : 'N/A'}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Exercise Type</Text>
                <div>{workoutStory?.exerciseType || 'N/A'}</div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text type="secondary">Duration</Text>
                <div style={{ color: getIntensityColor(workoutStory?.timeDuration || 0) }}>
                  {workoutStory?.timeDuration || 0} minutes
                </div>
              </div>
            </Col>
            <Col span={24}>
              <div>
                <Text type="secondary">Intensity</Text>
                <div>
                  <FireOutlined style={{ 
                    marginRight: '8px',
                    color: workoutStory?.intensity === 'No Efforts' ? '#52c41a' :
                           workoutStory?.intensity === 'Mid Efforts' ? '#1890ff' :
                           workoutStory?.intensity === 'Moderate Efforts' ? '#faad14' :
                           workoutStory?.intensity === 'Severe Efforts' ? '#f5222d' : '#722ed1'
                  }} />
                  {workoutStory?.intensity || 'N/A'}
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Divider style={{ margin: '8px 0', background: themeColors.border }} />
              <div>
                <Text type="secondary">Description</Text>
                <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>{workoutStory?.description || 'No description provided.'}</div>
              </div>
            </Col>
          </Row>
        </Card>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 4,
            height: 24,
            background: themeColors.primary,
            marginRight: 12,
            borderRadius: 2
          }} />
          <Title level={4} style={{ margin: 0, color: themeColors.textPrimary }}>
            Update Learning Plan
          </Title>
        </div>
      }
      open={snap.workoutStoryOpen}
      onCancel={() => {
        state.workoutStoryOpen = false;
      }}
      width={650}
      bodyStyle={{ 
        padding: '20px', 
        backgroundColor: themeColors.background,
        borderRadius: '10px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
      footer={null}
      centered
    >
      <Card 
        bordered={false} 
        style={{ 
          background: themeColors.cardBg,
          borderRadius: '10px',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
        >
          <Row gutter={24}>
            <Col span={24}>
              {(uploadedImage || workoutStory?.image) ? (
                <div style={{ 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  marginBottom: '16px',
                  position: 'relative'
                }}>
                  <img
                    style={{ 
                      width: "100%", 
                      height: "200px",
                      objectFit: 'cover'
                    }}
                    src={uploadedImage || workoutStory?.image}
                    alt="Learning Plan"
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '30px 16px 16px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  }}>
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
                          borderRadius: '6px'
                        }}
                      >
                        Change Image
                      </Button>
                    </Upload>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginBottom: '16px',
                  border: `1px dashed ${themeColors.border}`,
                  borderRadius: '10px',
                  padding: '40px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa'
                }}>
                  {imageUploading ? (
                    <Text>Uploading image...</Text>
                  ) : (
                    <Upload
                      accept="image/*"
                      onChange={handleFileChange}
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <UploadOutlined style={{ fontSize: '24px', color: themeColors.primary, marginBottom: '8px' }} />
                        <div>
                          <Text strong>Upload Plan Image</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>Recommend 16:9 ratio</Text>
                        </div>
                      </div>
                    </Upload>
                  )}
                </div>
              )}
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={16}>
              <Form.Item label={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <EditOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Title
                </span>
              } name="title" rules={[{ required: true, message: 'Please input a title' }]}>
                <Input
                  placeholder="Enter plan title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Date
                </span>
              } name="timestamp">
                <DatePicker
                  placeholder="Select date"
                  style={{ width: "100%", borderRadius: '6px' }}
                  value={formData.timestamp}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <TagOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
              Exercise Type
            </span>
          } name="exerciseType">
            <Input
              placeholder="What type of exercise?"
              name="exerciseType"
              value={formData.exerciseType}
              onChange={handleInputChange}
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>
          
          <Divider style={{ margin: '8px 0', background: themeColors.border }} />
          
          <Form.Item 
            label={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
                  Training Duration
                </span>
                <Text 
                  strong 
                  style={{ 
                    color: getIntensityColor(formData.timeDuration),
                  }}
                >
                  {formData.timeDuration} minutes
                </Text>
              </div>
            }
            name="timeDuration"
            style={{ marginBottom: 0 }}
          >
            <div style={{ 
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${themeColors.border}`,
              background: '#fafafa'
            }}>
              <Slider
                min={0}
                max={120}
                step={15}
                value={formData.timeDuration}
                marks={durationMarks}
                tooltip={{ formatter: value => `${value} min` }}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    timeDuration: value,
                  });
                }}
              />
            </div>
          </Form.Item>

          <Form.Item label={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <FireOutlined style={{ marginRight: '8px', color: themeColors.primary }} />
              Intensity Level
            </span>
          } name="intensity">
            <Select
              placeholder="Select intensity level"
              style={{ width: "100%", borderRadius: '6px' }}
              value={formData.intensity}
              onChange={handleIntensityChange}
              suffixIcon={<FireOutlined />}
              dropdownStyle={{ borderRadius: '6px' }}
            >
              <Option value="No Efforts">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                  No Efforts
                </div>
              </Option>
              <Option value="Mid Efforts">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                  Mid Efforts
                </div>
              </Option>
              <Option value="Moderate Efforts">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                  Moderate Efforts
                </div>
              </Option>
              <Option value="Severe Efforts">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ color: '#f5222d', marginRight: '8px' }} />
                  Severe Efforts
                </div>
              </Option>
              <Option value="Maximal Efforts">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ color: '#722ed1', marginRight: '8px' }} />
                  Maximal Efforts
                </div>
              </Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Add some details about this learning plan..."
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '16px'
            }}
          >
            <Button 
              key="cancel" 
              onClick={() => (state.workoutStoryOpen = false)}
              style={{
                borderRadius: '6px',
              }}
            >
              Cancel
            </Button>
            <div>
              <Button
                loading={deleteLoading}
                danger
                key="delete"
                style={{ 
                  marginRight: '10px',
                  borderRadius: '6px'
                }}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                loading={loading}
                key="update"
                type="primary"
                onClick={handleUpdateStory}
                style={{
                  background: themeColors.gradient,
                  borderColor: themeColors.primary,
                  borderRadius: '6px',
                  boxShadow: "0 2px 8px rgba(255, 107, 53, 0.3)"
                }}
              >
                Update Plan
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </Modal>
  );
};

export default UpdateStory;