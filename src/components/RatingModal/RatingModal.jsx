import React, { useState, useEffect } from 'react';
import { Modal, Form, Rate, Input, Button, message, Spin } from 'antd';
import NOTIFICATION_MESSAGES from '../../shared/constants/notificationMessages';
import {
  createServiceFeedback,
  getAppointmentFeedback,
  markAppointmentRated,
  updateServiceFeedback,
} from '../../features/feedback/feedbackApi';
import './RatingModal.css';

const { TextArea } = Input;

const RatingModal = ({ visible, onClose, appointment, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previousRating, setPreviousRating] = useState(null);

  // Fetch existing rating if appointment is already rated
  useEffect(() => {
    if (!visible || !appointment) return;

    const fetchExistingRating = async () => {
      if (appointment.isRated) {
        try {
          setLoading(true);
          // Fetch service feedback
          const feedbackRes = await getAppointmentFeedback(appointment.id);

          // Xử lý dữ liệu trả về có thể là array hoặc object
          const feedbackData = Array.isArray(feedbackRes.data)
            ? feedbackRes.data[0]
            : feedbackRes.data;

          if (!feedbackData) {
            throw new Error(NOTIFICATION_MESSAGES.RATING.NO_EXISTING_RATING);
          }

          setPreviousRating(feedbackData);

          // Lấy thông tin đánh giá bác sĩ từ consultantFeedbacks nếu có
          let consultantComment = "";

          if (feedbackData.consultantFeedbacks &&
            feedbackData.consultantFeedbacks.length > 0) {
            const consultantFeedback = feedbackData.consultantFeedbacks[0];
            consultantComment = consultantFeedback.comment || "";

          }

          // Set form values với cấu trúc mới
          form.setFieldsValue({
            serviceRating: feedbackData.rating || 0,
            serviceComment: feedbackData.comment || "",
            serviceCommentConsultant: consultantComment
          });

        } catch (error) {
          console.error("Lỗi khi lấy đánh giá cũ:", error);
          message.error(NOTIFICATION_MESSAGES.RATING.LOAD_FAILED);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset form for new rating
        form.resetFields();
        setPreviousRating(null);
      }
    };

    fetchExistingRating();
  }, [visible, appointment, form]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      try {
        if (appointment.isRated && previousRating) {
          // Update existing rating
          await updateServiceFeedback(previousRating.id, {
            rating: values.serviceRating,
            comment: values.serviceComment || "",
            commentConsultant: values.serviceCommentConsultant || "",
            appointmentId: appointment.id,
          });

          message.success(NOTIFICATION_MESSAGES.RATING.UPDATE_SUCCESS);
        } else {
          // Create new rating
          await createServiceFeedback({
            appointmentId: appointment.id,
            rating: values.serviceRating,
            comment: values.serviceComment || "",
            commentConsultant: values.serviceCommentConsultant || "",
          });

          // Update appointment isRated status using the specific API endpoint
          if (!appointment.isRated) {
            await markAppointmentRated(appointment.id);
          }

          message.success(NOTIFICATION_MESSAGES.RATING.CREATE_SUCCESS);
        }

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Close modal
        onClose();
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
          message.error(
            NOTIFICATION_MESSAGES.RATING.SUBMIT_FAILED(
              error.response?.data?.message || error.message
            )
          );
      } finally {
        setSubmitting(false);
      }
    } catch {
      setSubmitting(false);
    }
  };

  // If no appointment is selected, don't render
  if (!appointment) return null;

  return (
    <Modal
      title={NOTIFICATION_MESSAGES.RATING.TITLE}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {NOTIFICATION_MESSAGES.RATING.CANCEL}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
        >
          {NOTIFICATION_MESSAGES.RATING.SUBMIT}
        </Button>
      ]}
      width={500}
    >
      {loading ? (
        <div className="rating-loading">
          <Spin /> {NOTIFICATION_MESSAGES.RATING.LOADING}
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <p className="service-name">
            {NOTIFICATION_MESSAGES.RATING.EXPERIENCE_PROMPT(
              appointment.serviceName
            )}
          </p>

          <Form.Item
            name="serviceRating"
            label={
              <span className="required-label">
                {NOTIFICATION_MESSAGES.RATING.SERVICE_LABEL}
              </span>
            }
            rules={[
              {
                required: true,
                message: NOTIFICATION_MESSAGES.RATING.SERVICE_REQUIRED,
              },
            ]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item
            name="serviceComment"
            label={NOTIFICATION_MESSAGES.RATING.SERVICE_COMMENT_LABEL}
          >
            <TextArea
              rows={4}
              placeholder={
                NOTIFICATION_MESSAGES.RATING.SERVICE_COMMENT_PLACEHOLDER
              }
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="serviceCommentConsultant"
            label={NOTIFICATION_MESSAGES.RATING.CONSULTANT_COMMENT_LABEL}
          >
            <TextArea
              rows={4}
              placeholder={
                NOTIFICATION_MESSAGES.RATING.CONSULTANT_COMMENT_PLACEHOLDER
              }
              maxLength={500}
              showCount
            />
          </Form.Item>


        </Form>
      )}
    </Modal>
  );
};

export default RatingModal;






