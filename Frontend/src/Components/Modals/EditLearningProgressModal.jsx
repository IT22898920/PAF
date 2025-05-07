// export default EditLearningProgressModal;
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  message,
  Divider,
  Tag,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import LearningProgressService from "../../Services/LearningProgressService";

const { TextArea } = Input;
const { Title, Text } = Typography;

// Use the same theme colors as your card component
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

const EditLearningProgressModal = () => {
  const snap = useSnapshot(state);
  const selectedPlan = snap.selectedLearningProgress;
  const [updateLoading, setUpdateLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedPlan && form) {
      form.setFieldsValue({
        planName: selectedPlan.planName,
        description: selectedPlan.description,
        routines: selectedPlan.routines,
        goal: selectedPlan.goal,
        category: selectedPlan.category,
      });
    }
  }, [selectedPlan, form]);

  const updateLearningProgress = async (values) => {
    try {
      setUpdateLoading(true);
      const body = {
        ...values,
        userId: snap.currentUser?.uid,
        lastUpdated: new Date().toISOString().split("T")[0],
        completedItems: selectedPlan.completedItems,
        totalItems: selectedPlan.totalItems,
      };

      await LearningProgressService.updateLearningProgress(
        selectedPlan.id,
        body
      );

      const updatedPlans =
        await LearningProgressService.getAllLearningProgresss();
      state.LearningProgresss = updatedPlans;

      const updatedPlan = updatedPlans.find(
        (plan) => plan.id === selectedPlan.id
      );
      if (updatedPlan) {
        state.selectedLearningProgress = updatedPlan;
      }

      state.editLearningProgressOpened = false;
      message.success("Learning Progress updated successfully!");
    } catch (error) {
      console.error("Failed to update Learning Progress:", error);
      message.error("Failed to update Learning Progress. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
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
            Edit Learning Plan
          </Title>
          {selectedPlan && (
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                display: "block",
                marginTop: 4,
              }}
            >
              {selectedPlan.planName}
            </Text>
          )}
        </div>
      }
      open={snap.editLearningProgressOpened}
      onCancel={() => {
        state.editLearningProgressOpened = false;
        form.resetFields();
      }}
      footer={null}
      destroyOnClose={true}
      width={700}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          padding: "24px",
        }}
      >
        <Form form={form} layout="vertical" onFinish={updateLearningProgress}>
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
                onClick={() => {
                  state.editLearningProgressOpened = false;
                  form.resetFields();
                }}
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
                loading={updateLoading}
                style={{
                  background: themeColors.gradient,
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(94, 53, 177, 0.2)",
                  fontWeight: 500,
                }}
              >
                Update Plan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default EditLearningProgressModal;
