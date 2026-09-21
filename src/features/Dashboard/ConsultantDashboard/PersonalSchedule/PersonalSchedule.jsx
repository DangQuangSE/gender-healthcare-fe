import React, { useCallback, useEffect, useState } from "react";
import { Card, DatePicker, Modal, Table, Tabs } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { showToast } from "../../../../utils/toast";
import {
  getMySchedule,
  updateAppointmentDetailStatus,
} from "./personalScheduleApi";
import MedicalResultFormConsulting from "../../../../components/MedicalResult/MedicalResultFormConsulting";
import MedicalResultFormTesting from "../../../../components/MedicalResult/MedicalResultFormTesting";
import storage from "../../../../shared/storage/storage";
import { getApiErrorMessage } from "../../../../shared/api/errors";
import PersonalScheduleEmptyState from "./PersonalScheduleEmptyState";
import PersonalScheduleStats from "./PersonalScheduleStats";
import { createPersonalScheduleColumns } from "./PersonalScheduleColumns";
import {
  PERSONAL_SCHEDULE_CACHE_TTL_MS,
  PERSONAL_SCHEDULE_MESSAGES,
  PERSONAL_SCHEDULE_STATUS_BY_TAB,
  PERSONAL_SCHEDULE_STATUSES,
} from "./personalScheduleConstants";
import { EMPTY_TABS_DATA } from "./PersonalSchedule.constants";
import "./PersonalSchedule.css";

const enrichAppointmentDetails = (appointments, userId, includeServiceType) =>
  appointments.flatMap((appointment) =>
    (appointment.appointmentDetails || [])
      .filter((detail) => detail.consultantId === userId)
      .map((detail) => ({
        ...detail,
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        preferredDate: appointment.preferredDate,
        appointmentNote: appointment.note,
        appointmentStatus: appointment.status,
        created_at: appointment.created_at,
        isPaid: appointment.isPaid,
        paymentStatus: appointment.paymentStatus,
        ...(includeServiceType ? { serviceType: appointment.serviceType } : {}),
      }))
  );

const PersonalSchedule = ({ userId }) => {
  const [tabsData, setTabsData] = useState(EMPTY_TABS_DATA);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [tabLoadingStates, setTabLoadingStates] = useState({
    CHECKED: false,
    IN_PROGRESS: false,
    WAITING_RESULT: false,
    COMPLETED: false,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDateStr, setCurrentDateStr] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [activeTab, setActiveTab] = useState("checked");
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [selectedAppointmentDetail, setSelectedAppointmentDetail] =
    useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const getCacheKey = useCallback(
    (date, status) => `schedule_${userId}_${date}_${status}`,
    [userId]
  );

  const saveToCache = useCallback(
    (date, status, data) => {
      try {
        const timestamp = Date.now();
        storage.setJson(getCacheKey(date, status), {
          data,
          timestamp,
          expiry: timestamp + PERSONAL_SCHEDULE_CACHE_TTL_MS,
        });
      } catch {
        // Cache failures must not block the schedule request.
      }
    },
    [getCacheKey]
  );

  const getFromCache = useCallback(
    (date, status) => {
      try {
        const cacheData = storage.getJson(getCacheKey(date, status));
        if (!cacheData) return null;
        if (Date.now() > cacheData.expiry) {
          storage.remove(getCacheKey(date, status));
          return null;
        }
        return cacheData.data;
      } catch {
        return null;
      }
    },
    [getCacheKey]
  );

  const loadAppointmentsByStatus = useCallback(
    async (date, status, useCache = true) => {
      const targetDate = date || dayjs().format("YYYY-MM-DD");

      if (useCache) {
        const cachedData = getFromCache(targetDate, status);
        if (cachedData) {
          setTabsData((previous) => ({ ...previous, [status]: cachedData }));
          return cachedData;
        }
      }

      setTabLoadingStates((previous) => ({ ...previous, [status]: true }));
      try {
        let appointments = [];
        if (status === "CHECKED") {
          const [checkedResponse, confirmedResponse] = await Promise.all([
            getMySchedule(targetDate, "CHECKED"),
            getMySchedule(targetDate, "CONFIRMED"),
          ]);
          appointments = [
            ...(checkedResponse || []),
            ...(confirmedResponse || []).filter(
              (appointment) => appointment.serviceType === "CONSULTING_ON"
            ),
          ];
        } else {
          appointments = (await getMySchedule(targetDate, status)) || [];
        }

        saveToCache(targetDate, status, appointments);
        setTabsData((previous) => ({ ...previous, [status]: appointments }));
        return appointments;
      } catch (error) {
        showToast.error(
          PERSONAL_SCHEDULE_MESSAGES.LOAD_FAILED(
            status,
            getApiErrorMessage(error)
          )
        );
        return [];
      } finally {
        setTabLoadingStates((previous) => ({ ...previous, [status]: false }));
      }
    },
    [getFromCache, saveToCache]
  );

  const loadAllTabsData = useCallback(
    async (date, useCache = true) => {
      const targetDate = date || dayjs().format("YYYY-MM-DD");
      setAppointmentsLoading(true);
      try {
        const results = await Promise.allSettled(
          PERSONAL_SCHEDULE_STATUSES.map((status) =>
            loadAppointmentsByStatus(targetDate, status, useCache)
          )
        );
        const successCount = results.filter(
          (result) => result.status === "fulfilled"
        ).length;
        showToast.success(
          PERSONAL_SCHEDULE_MESSAGES.LOAD_ALL_SUCCESS(
            successCount,
            PERSONAL_SCHEDULE_STATUSES.length
          )
        );
      } catch {
        showToast.error(PERSONAL_SCHEDULE_MESSAGES.LOAD_ALL_FAILED);
      } finally {
        setAppointmentsLoading(false);
      }
    },
    [loadAppointmentsByStatus]
  );

  useEffect(() => {
    if (userId) {
      loadAllTabsData(dayjs().format("YYYY-MM-DD"), true);
    }
  }, [userId, loadAllTabsData]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const status = PERSONAL_SCHEDULE_STATUS_BY_TAB[key] || "CHECKED";
    loadAppointmentsByStatus(currentDateStr, status, false);
  };

  const handleDateChange = (date) => {
    const selectedDayjs = date || dayjs();
    const dateStr = selectedDayjs.format("YYYY-MM-DD");
    setSelectedDate(selectedDayjs.toDate());
    setCurrentDateStr(dateStr);
    loadAllTabsData(dateStr, false);
  };

  const getCurrentTabData = () => {
    const status = PERSONAL_SCHEDULE_STATUS_BY_TAB[activeTab] || "CHECKED";
    return tabsData[status] || [];
  };

  const currentTabDetails = enrichAppointmentDetails(
    getCurrentTabData(),
    userId,
    true
  );
  const allMyDetails = enrichAppointmentDetails(
    PERSONAL_SCHEDULE_STATUSES.flatMap((status) => tabsData[status] || []),
    userId,
    false
  );
  const statistics = {
    total: allMyDetails.length,
    checked: allMyDetails.filter((detail) => detail.status === "CHECKED").length,
    inProgress: allMyDetails.filter(
      (detail) => detail.status === "IN_PROGRESS"
    ).length,
    waitingResult: allMyDetails.filter(
      (detail) => detail.status === "WAITING_RESULT"
    ).length,
    completed: allMyDetails.filter((detail) => detail.status === "COMPLETED")
      .length,
  };

  const refetchStatuses = async (statuses) => {
    const date = dayjs(selectedDate).format("YYYY-MM-DD");
    await Promise.allSettled(
      [...new Set(statuses)].map((status) =>
        loadAppointmentsByStatus(date, status, false)
      )
    );
  };

  const handleStatusUpdate = async (detailId, newStatus, confirmMessage) => {
    try {
      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: PERSONAL_SCHEDULE_MESSAGES.STATUS_CONFIRM_TITLE,
          content: confirmMessage,
          okText: PERSONAL_SCHEDULE_MESSAGES.CONFIRM,
          cancelText: PERSONAL_SCHEDULE_MESSAGES.CANCEL,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmed) return;

      const currentStatus =
        PERSONAL_SCHEDULE_STATUS_BY_TAB[activeTab] || "CHECKED";
      setStatusUpdateLoading(true);
      await updateAppointmentDetailStatus(detailId, newStatus);
      showToast.success(PERSONAL_SCHEDULE_MESSAGES.STATUS_UPDATED);
      await refetchStatuses([currentStatus, newStatus]);
    } catch (error) {
      showToast.error(
        getApiErrorMessage(error, PERSONAL_SCHEDULE_MESSAGES.STATUS_UPDATE_FAILED)
      );
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleStartExamination = async (detailId, startUrl = null) => {
    try {
      const confirmed = await new Promise((resolve) => {
        Modal.confirm({
          title: PERSONAL_SCHEDULE_MESSAGES.STATUS_CONFIRM_TITLE,
          content: PERSONAL_SCHEDULE_MESSAGES.START_CONFIRM,
          okText: PERSONAL_SCHEDULE_MESSAGES.CONFIRM,
          cancelText: PERSONAL_SCHEDULE_MESSAGES.CANCEL,
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmed) return;

      const currentStatus =
        PERSONAL_SCHEDULE_STATUS_BY_TAB[activeTab] || "CHECKED";
      setStatusUpdateLoading(true);
      await updateAppointmentDetailStatus(detailId, "IN_PROGRESS");
      showToast.success(PERSONAL_SCHEDULE_MESSAGES.STATUS_UPDATED);
      await refetchStatuses([currentStatus, "IN_PROGRESS"]);
      if (startUrl) window.open(startUrl, "_blank");
    } catch (error) {
      showToast.error(
        getApiErrorMessage(error, PERSONAL_SCHEDULE_MESSAGES.STATUS_UPDATE_FAILED)
      );
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const openResultModal = (detail) => {
    setSelectedAppointmentDetail(detail);
    setIsResultModalVisible(true);
  };

  const closeResultModal = () => {
    setIsResultModalVisible(false);
    setSelectedAppointmentDetail(null);
  };

  const handleMedicalResultSuccess = async (successMessage) => {
    showToast.success(successMessage);
    try {
      if (selectedAppointmentDetail?.id) {
        await updateAppointmentDetailStatus(
          selectedAppointmentDetail.id,
          "COMPLETED"
        );
      }
    } catch {
      // Status reconciliation can retry during the next refresh.
    }

    closeResultModal();
    const currentStatus =
      PERSONAL_SCHEDULE_STATUS_BY_TAB[activeTab] || "CHECKED";
    await refetchStatuses([currentStatus, "COMPLETED"]);
  };

  const tabItems = [
    {
      key: "checked",
      label: (
        <span>
          <CheckCircleOutlined />
          {PERSONAL_SCHEDULE_MESSAGES.CHECKED(statistics.checked)}
        </span>
      ),
    },
    {
      key: "in_progress",
      label: (
        <span>
          <ClockCircleOutlined />
          {PERSONAL_SCHEDULE_MESSAGES.IN_PROGRESS(statistics.inProgress)}
        </span>
      ),
    },
    {
      key: "waiting_result",
      label: (
        <span>
          <ExclamationCircleOutlined />
          {PERSONAL_SCHEDULE_MESSAGES.WAITING_RESULT(statistics.waitingResult)}
        </span>
      ),
    },
    {
      key: "completed",
      label: (
        <span>
          <CheckCircleOutlined />
          {PERSONAL_SCHEDULE_MESSAGES.COMPLETED(statistics.completed)}
        </span>
      ),
    },
  ];

  const columns = createPersonalScheduleColumns({
    activeTab,
    getCurrentTabData,
    onStartExamination: handleStartExamination,
    onWaitForResult: (detailId) =>
      handleStatusUpdate(
        detailId,
        "WAITING_RESULT",
        PERSONAL_SCHEDULE_MESSAGES.WAIT_CONFIRM
      ),
    onOpenResultModal: openResultModal,
    statusUpdateLoading,
  });

  return (
    <div className="personal-schedule-container">
      <div className="personal-schedule-header">
        <h1 className="personal-schedule-title">
          <CalendarOutlined /> {PERSONAL_SCHEDULE_MESSAGES.TITLE}
        </h1>
        <p className="personal-schedule-subtitle">
          {PERSONAL_SCHEDULE_MESSAGES.SUBTITLE}
        </p>
      </div>

      <PersonalScheduleStats statistics={statistics} />

      <Card className="date-picker-card">
        <div className="date-picker-container">
          <span className="date-picker-label">
            <CalendarOutlined /> {PERSONAL_SCHEDULE_MESSAGES.DATE_LABEL}:
          </span>
          <DatePicker
            value={dayjs(selectedDate).startOf("day")}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder={PERSONAL_SCHEDULE_MESSAGES.DATE_PLACEHOLDER}
            className="date-picker-input"
            allowClear={false}
          />
          <span className="date-picker-info">
            {PERSONAL_SCHEDULE_MESSAGES.DATE_INFO(
              selectedDate.toLocaleDateString("vi-VN")
            )}
          </span>
        </div>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />
        <Table
          columns={columns}
          dataSource={currentTabDetails}
          rowKey="id"
          loading={
            appointmentsLoading ||
            Object.values(tabLoadingStates).some(Boolean)
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              PERSONAL_SCHEDULE_MESSAGES.PAGINATION_TOTAL(
                range[0],
                range[1],
                total
              ),
          }}
          locale={{
            emptyText: (
              <PersonalScheduleEmptyState
                date={selectedDate.toLocaleDateString("vi-VN")}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={PERSONAL_SCHEDULE_MESSAGES.RESULT_TITLE(
          selectedAppointmentDetail?.serviceType
        )}
        open={isResultModalVisible}
        onCancel={closeResultModal}
        footer={null}
        width={
          selectedAppointmentDetail?.serviceType === "TESTING" ? 1200 : 1000
        }
        destroyOnClose
      >
        {selectedAppointmentDetail?.serviceType === "TESTING" ? (
          <MedicalResultFormTesting
            appointmentDetail={selectedAppointmentDetail}
            onSuccess={() =>
              handleMedicalResultSuccess(
                PERSONAL_SCHEDULE_MESSAGES.RESULT_SAVED_TEST
              )
            }
            onCancel={closeResultModal}
          />
        ) : (
          <MedicalResultFormConsulting
            appointmentDetail={selectedAppointmentDetail}
            onSuccess={() =>
              handleMedicalResultSuccess(
                PERSONAL_SCHEDULE_MESSAGES.RESULT_SAVED_CONSULTATION
              )
            }
            onCancel={closeResultModal}
          />
        )}
      </Modal>
    </div>
  );
};

export default PersonalSchedule;
