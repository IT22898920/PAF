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
  Row,
  Col
} from "antd";
import { 
  UploadOutlined, 
  ClockCircleOutlined, 
  FireOutlined 
} from "@ant-design/icons";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import StoryService from "../../Services/StoryService";
import moment from "moment";

const uploader = new UploadFileService();
const { Option } = Select;

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
    0: '0 min',
    15: '15 min',
    30: '30 min',
    45: '45 min',
    60: '1 hr',
    90: '1.5 hr',
    120: '2 hr'
  };

  // Function to get intensity color based on duration
  const getIntensityColor = (duration) => {
    if (duration < 15) return '#52c41a';     // Light green - Easy
    if (duration < 30) return '#1890ff';     // Blue - Moderate
    if (duration < 60) return '#faad14';     // Orange - Intense
    return '#f5222d';                        // Red - Very Intense
  };

  return (
    <Modal
      title="Update Learning Plan"
      open={snap.workoutStoryOpen}
      onCancel={() => {
        state.workoutStoryOpen = false;
      }}
      width={500}
      bodyStyle={{ 
        padding: '10px', 
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
      footer={[
        userId === workoutStory?.userId && (
          <div 
            key="editingButtons" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '5px'
            }}
          >
            <Button 
              key="cancel" 
              onClick={() => (state.workoutStoryOpen = false)}
            >
              Cancel
            </Button>
            <div>
              <Button
                loading={deleteLoading}
                danger
                key="delete"
                type="primary"
                style={{ marginRight: '10px' }}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                loading={loading}
                key="submit"
                type="primary"
                onClick={handleUpdateStory}
              >
                Update
              </Button>
            </div>
          </div>
        ),
      ]}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px'
      }}>
        {/* Image Upload */}
        <div style={{ 
          height: '200px', 
          borderRadius: '8px', 
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <img
            style={{ 
              width: "100%", 
              height: "100%",
              objectFit: 'cover'
            }}
            src={uploadedImage || workoutStory?.image}
            alt="Learning Plan"
          />
        </div>

        <Form 
          form={form} 
          layout="vertical"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px' 
          }}
        >
          {/* First Row: Title and Exercise Type */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Title" 
                name="title" 
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  size="small"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Exercise Type" 
                name="exerciseType" 
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Exercise Type"
                  name="exerciseType"
                  value={formData.exerciseType}
                  onChange={handleInputChange}
                  size="small"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Second Row: Timestamp and Intensity */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Timestamp" 
                name="timestamp" 
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  placeholder="Timestamp"
                  style={{ width: "100%" }}
                  value={formData.timestamp}
                  onChange={handleDateChange}
                  size="small"
                />
              </Form.Item>
              
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Intensity" 
                name="intensity" 
                style={{ marginBottom: 0 }}
              >
                <Select
                  placeholder="Select Intensity"
                  style={{ width: "100%" }}
                  value={formData.intensity}
                  onChange={handleIntensityChange}
                  size="small"
                  suffixIcon={<FireOutlined />}
                >
                  <Option value="No Efforts">No Efforts</Option>
                  <Option value="Mid Efforts">Mid Efforts</Option>
                  <Option value="Moderate Efforts">Moderate Efforts</Option>
                  <Option value="Severe Efforts">Severe Efforts</Option>
                  <Option value="Maximal Efforts">Maximal Efforts</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Time Duration Slider */}
          
          <Form.Item 
            label="Time Duration" 
            name="timeDuration"
            style={{ marginBottom: 0 }}
          >
            <Slider
              min={0}
              max={120}
              step={15}
              value={formData.timeDuration}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  timeDuration: value,
                });
              }}
              marks={{
                0: '0m',
                30: '30m',
                60: '1h',
                120: '2h'
              }}
            />
          </Form.Item>

          {/* Description */}
          <Form.Item 
            label="Description" 
            name="description"
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </Form.Item>

          {/* Image Upload Button */}
          <Upload
            accept="image/*"
            onChange={handleFileChange}
            showUploadList={false}
            beforeUpload={() => false}
          >
            <Button 
              icon={<UploadOutlined />} 
              type="dashed"
              style={{ width: '100%' }}
              size="small"
            >
              Upload New Image
            </Button>
          </Upload>
        </Form>
      </div>
    </Modal>
  );
};

export default UpdateStory;