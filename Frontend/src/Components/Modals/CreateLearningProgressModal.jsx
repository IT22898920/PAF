// import React, { useState } from "react";
// import { Modal, Form, Input, Button, message, Space, Typography } from "antd";
// import { useSnapshot } from "valtio";
// import state from "../../Utils/Store";
// import LearningProgressService from "../../Services/LearningProgressService";

// const { Title } = Typography;
// const themeColors = {
//   primary: "#FF6B35", // Bright and inviting orange
//   secondary: "#FF8F1C", // Softer tangerine for a modern touch
//   accent: "#FF4500", // Fresh red-orange for highlights
//   background: "#FFF5E6", // Light orangeish-white for a clean look
//   surface: "#FFF0D9", // Soft light orange for surfaces
//   cardBg: "#FFFFFF", // White background for cards
//   textPrimary: "#1E3A5F", // Deep navy for readability
//   textSecondary: "#5A7184", // Muted blue-gray for secondary text
//   border: "rgba(0, 0, 0, 0.12)", // Subtle neutral border
//   hover: "#FF5733", // Slightly darker orange for hover effects
//   danger: "#FF4D4F", // Friendly red for warnings
//   success: "#28A745", // Balanced green for success messages
//   gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8F1C 100%)", // Light, engaging orange gradient
// };

// const CreateLearningProgressModal = () => {
//   const snap = useSnapshot(state);
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       const values = await form.validateFields();

//       // Create Learning Progress data object
//       const LearningProgressData = {
//         userId: snap.currentUser?.uid,
//         planName: values.planName,
//         description: values.description,
//         goal: values.goal,
//         routines: values.routines,
//       };

//       await LearningProgressService.CreateLearningProgressModal(LearningProgressData);
//       state.LearningProgresss = await LearningProgressService.getAllLearningProgresss();

//       // Success message
//       message.success("Learning Progress created successfully!");

//       // Reset form and close modal
//       form.resetFields();
//       state.CreateLearningProgressModalOpened = false;
//     } catch (error) {
//       console.error("Form validation failed:", error);

//       // Error message
//       message.error("Failed to create Learning Progress. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     form.resetFields();
//     state.CreateLearningProgressModalOpened = false;
//   };

//   return (
//     <Modal
//       title={<Title level={4}>Create New Learning Progress</Title>}
//       footer={null}
//       visible={snap.CreateLearningProgressModalOpened}
//       onCancel={handleCancel}
//       width={550}
//       centered
//       destroyOnClose
//     >
//       <Form form={form} layout="vertical" onFinish={handleSubmit}>
//         <Form.Item
//           name="planName"
//           label="Title"
//           rules={[{ required: true, message: "Please add a title" }]}
//         >
//           <Input
//             placeholder="Give a brief title for your progress update"
//             style={{ borderRadius: 8 }}
//           />
//         </Form.Item>

//         <Form.Item
//           name="description"
//           label="Description"
//           rules={[{ required: true, message: "Please enter description" }]}
//         >
//           <Input.TextArea
//             placeholder="Describe your recent learning progress"
//             rows={4}
//             style={{ borderRadius: 8 }}
//           />
//         </Form.Item>

//         <Form.Item
//           name="goal"
//           label="Tutorials"
//           rules={[{ required: true, message: "Please enter tutorials" }]}
//         >
//           <Input
//             placeholder="Skills you learned from this update"
//             style={{ borderRadius: 8 }}
//           />
//         </Form.Item>

//         <Form.Item
//           name="routines"
//           label="New skills learned"
//           rules={[{ required: true, message: "Please enter Skills" }]}
//         >
//           <Input.TextArea
//             placeholder="Skills you have acquired"
//             rows={3}
//             style={{ borderRadius: 8 }}
//           />
//         </Form.Item>

//         <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
//           <Space style={{ display: "flex", justifyContent: "flex-end" }}>
//             <Button
//               onClick={handleCancel}
//               style={{ borderRadius: 8, borderColor: themeColors.primary, }}

//             >
//               Cancel
//             </Button>
//             <Button
//               type="primary"
//               htmlType="submit"
//               loading={loading}
//               style={{
//                 background: themeColors.primary, // #FF6B35 orange
//                 borderColor: themeColors.primary,
//                 borderRadius: 8,
//                 boxShadow: "0 2px 8px rgba(255, 107, 53, 0.2)"
//               }}
//             >
//               {loading ? "Creating..." : "Create Progress"}
//             </Button>
//           </Space>
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// export default CreateLearningProgressModal;

import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Divider,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningProgressService from "../../Services/LearningProgressService";

const { TextArea } = Input;
const { Title, Text } = Typography;

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
};

const CreateLearningProgressModal = () => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const LearningProgressData = {
        userId: snap.currentUser?.uid,
        planName: values.planName,
        description: values.description,
        goal: values.goal,
        routines: values.routines,
        completedItems: 0,
        totalItems: 10, // Default value
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      await LearningProgressService.CreateLearningProgressModal(
        LearningProgressData
      );
      state.LearningProgresss =
        await LearningProgressService.getAllLearningProgresss();

      message.success("Learning Progress created successfully!");
      form.resetFields();
      state.CreateLearningProgressModalOpened = false;
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Failed to create Learning Progress. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    state.CreateLearningProgressModalOpened = false;
  };

  return (
    <Modal
      title={
        <div
          style={{
            background: themeColors.gradient,
            color: "white",
            padding: "16px 24px",
            margin: "-24px -24px 24px -24px",
            borderRadius: "8px 8px 0 0",
          }}
        >
          <Title level={4} style={{ color: "white", margin: 0 }}>
            Create New Learning Plan
          </Title>
        </div>
      }
      footer={null}
      visible={snap.CreateLearningProgressModalOpened}
      onCancel={handleCancel}
      width={700}
      centered
      destroyOnClose
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          padding: "24px",
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div
            style={{
              background: themeColors.surface,
              borderRadius: 12,
              padding: "16px",
              marginBottom: 16,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <Form.Item
              name="planName"
              label={
                <Text strong style={{ color: themeColors.textPrimary }}>
                  Plan Name
                </Text>
              }
              rules={[{ required: true, message: "Please enter a plan name" }]}
            >
              <Input
                placeholder="Enter plan name"
                style={{
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.8)",
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <Text strong style={{ color: themeColors.textPrimary }}>
                  Description
                </Text>
              }
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea
                placeholder="Describe your learning plan"
                autoSize={{ minRows: 3, maxRows: 6 }}
                style={{
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.8)",
                }}
              />
            </Form.Item>
          </div>

          <div
            style={{
              background: themeColors.surface,
              borderRadius: 12,
              padding: "16px",
              marginBottom: 16,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <Form.Item
              name="routines"
              label={
                <Text strong style={{ color: themeColors.textPrimary }}>
                  Skills to Learn (comma separated)
                </Text>
              }
              rules={[{ required: true, message: "Please enter skills" }]}
            >
              <Input
                placeholder="e.g. React, JavaScript, UI Design"
                style={{
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.8)",
                }}
              />
            </Form.Item>

            <Form.Item
              name="goal"
              label={
                <Text strong style={{ color: themeColors.textPrimary }}>
                  Tutorials & Resources
                </Text>
              }
              rules={[{ required: true, message: "Please enter tutorials" }]}
            >
              <TextArea
                placeholder="List tutorials or resources for this plan"
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.8)",
                }}
              />
            </Form.Item>
          </div>

          <Divider style={{ borderColor: themeColors.border }} />

          <Form.Item style={{ marginTop: 16 }}>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                onClick={handleCancel}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${themeColors.primary}`,
                  color: themeColors.primary,
                  background: "transparent",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background: themeColors.gradient,
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(94, 53, 177, 0.2)",
                  fontWeight: 500,
                }}
              >
                {loading ? "Creating..." : "Create Plan"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateLearningProgressModal;
