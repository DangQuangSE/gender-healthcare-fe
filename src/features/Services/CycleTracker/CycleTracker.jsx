import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, isSameDay, startOfDay } from "date-fns";
import Calendar from "./Calendar";
import LogModal from "./LogModal";
import "./CycleTracker.css";
import { useSelector } from "react-redux";
import authStorage from "../../../shared/storage/authStorage";
import { useCycleTrackerData } from "./useCycleTrackerData";
import { getCycleWarnings, getRecommendations } from "./cycleTrackerUtils";
import { SYMPTOM_LABELS } from "./cycleTrackerConstants";

const CycleTracker = () => {
  const reduxToken = useSelector((state) => state.user.jwt || state.user.token);
  const token = reduxToken || authStorage.getToken();

  // Đã bỏ notifications
  const [showGuide, setShowGuide] = useState(false);
  const [selectedDay, setSelectedDay] = useState(startOfDay(new Date()));
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSymptomStatsModal, setShowSymptomStatsModal] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    date: null,
    periodDayNumber: null,
  });
  const { userData, predictions, loading, handleSaveLog, setUserData } =
    useCycleTrackerData(token);

  // Lấy logs từ API mới (không truyền userId)
  // Thống kê triệu chứng theo filter
  const filteredSymptomStats = {};
  Object.entries(userData.logs).forEach(([date, log]) => {
    if (
      (!filterStart || date >= filterStart) &&
      (!filterEnd || date <= filterEnd)
    ) {
      (log.symptoms || []).forEach((symptom) => {
        filteredSymptomStats[symptom] =
          (filteredSymptomStats[symptom] || 0) + 1;
      });
    }
  });

  const chartData = Object.entries(filteredSymptomStats).map(
    ([symptom, count]) => ({
      symptom,
      count,
    })
  );

  const handleCloseModal = () =>
    setModalInfo({ isOpen: false, date: null, periodDayNumber: null });

  const handleDayClick = (day) => {
    setSelectedDay(startOfDay(day));
    let periodDayNumber = null;
    if (predictions && predictions.periodDayNumbers) {
      const dateKey = format(day, "yyyy-MM-dd");
      periodDayNumber = predictions.periodDayNumbers[dateKey] || null;
    }
    setModalInfo({
      isOpen: true,
      date: day,
      periodDayNumber: periodDayNumber,
    });
  };

  const renderNotifications = () => {
    if (!predictions) return null;
    const warnings = getCycleWarnings(userData.periodHistory);
    const notifications = [];
    if (isSameDay(selectedDay, predictions.ovulationNotificationDay)) {
      notifications.push(
        <div key="ovulation-noti" className="notification-item info">
          <strong>💖 Nhắc nhở:</strong> Giai đoạn dễ thụ thai của bạn sắp bắt
          đầu! Ngày rụng trứng dự kiến là sau 2 ngày nữa.
        </div>
      );
    }
    if (isSameDay(selectedDay, predictions.notificationDay)) {
      notifications.push(
        <div key="period-noti" className="notification-item warning">
          <strong>🔔 Nhắc nhở:</strong> Kỳ kinh của bạn dự kiến sẽ bắt đầu sau 2
          ngày nữa!
        </div>
      );
    }
    if (isSameDay(selectedDay, predictions.ovulationDay)) {
      notifications.push(
        <div key="ovulation-today" className="notification-item info">
          <strong>💖 Thông báo:</strong> Hôm nay là ngày rụng trứng dự kiến của
          bạn.
        </div>
      );
    }
    warnings.forEach((w, idx) => {
      notifications.push(
        <div key={`warning-${idx}`} className="notification-item danger">
          ⚠️ {w}
        </div>
      );
    });
    return <>{notifications}</>;
  };

  const recommendations = getRecommendations({
    predictions,
    selectedDay,
    userData,
  });

  return (
    <div className="cycle-tracker-container">
      {/* Đã bỏ notifications từ backend */}
      {loading && <div>Đang tải dữ liệu...</div>}
      {modalInfo.isOpen && (
        <LogModal
          date={modalInfo.date}
          periodDayNumber={modalInfo.periodDayNumber}
          existingLog={
            userData.logs[format(modalInfo.date, "yyyy-MM-dd")]
              ? {
                  ...userData.logs[format(modalInfo.date, "yyyy-MM-dd")],
                  symptoms: (
                    userData.logs[format(modalInfo.date, "yyyy-MM-dd")]
                      .symptoms || []
                  ).map((sym) => SYMPTOM_LABELS[sym] || sym),
                }
              : undefined
          }
          onSave={handleSaveLog}
          onClose={handleCloseModal}
        />
      )}
      {recommendations.length > 0 && (
        <div className="recommendations-box">
          <strong>Gợi ý cho bạn:</strong>
          <ul>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: 8, whiteSpace: "pre-line" }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        className="guide-preview"
        style={{
          background: "#f3f4f6",
          borderLeft: "4px solid #6366f1",
          padding: "10px 16px",
          borderRadius: "6px",
          margin: "12px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>
          <b>💡 Hướng dẫn sử dụng:</b> Xem các bước sử dụng CycleTracking cho
          người mới.
        </span>
        <button
          className="button-secondary"
          style={{ marginLeft: 16 }}
          onClick={() => setShowGuide(true)}
        >
          Xem chi tiết
        </button>
      </div>
      <header className="tracker-header">
        <h1>Theo dõi chu kỳ kinh nguyệt</h1>
        <p>
          Nhấp vào một ngày để ghi lại thông tin và nhận dự đoán chính xác hơn.
        </p>
      </header>
      {showGuide && (
        <div className="modal-overlay" onClick={() => setShowGuide(false)}>
          <div
            className="modal-content guide-modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-button"
              onClick={() => setShowGuide(false)}
              aria-label="Đóng"
            >
              ×
            </button>

            <h2 style={{ color: "#4f46e5", fontWeight: 700, marginBottom: 12 }}>
              Hướng dẫn sử dụng CycleTracking
            </h2>

            <p style={{ marginBottom: 16 }}>
              <b>Chu kỳ kinh nguyệt</b> là quá trình sinh lý tự nhiên lặp lại
              hàng tháng của cơ thể người có tử cung, bao gồm các giai đoạn:
              hành kinh (có kinh), giai đoạn nang trứng, rụng trứng và hoàng
              thể. Theo dõi chu kỳ giúp bạn hiểu rõ hơn về sức khỏe sinh sản,
              tâm trạng và thể chất của chính mình.
            </p>

            <ol style={{ marginLeft: 20, paddingLeft: 0, marginBottom: 0 }}>
              <li style={{ marginBottom: 12 }}>
                <b> Chọn ngày trên lịch:</b> Nhấn vào bất kỳ ngày nào trên lịch
                để mở form ghi chú. Bạn có thể sử dụng lịch để ghi nhận thông
                tin theo từng ngày một cách trực quan.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>🔴 Đánh dấu ngày bắt đầu kỳ kinh:</b> Nếu ngày đó là ngày đầu
                tiên bạn bắt đầu có kinh nguyệt, hãy tick vào ô "Đánh dấu là
                ngày bắt đầu kỳ kinh". Đây là bước **rất quan trọng**, vì hệ
                thống sẽ dựa vào đó để tính toán và dự đoán chu kỳ tiếp theo và
                thời điểm rụng trứng.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b> Ghi chú thêm:</b> Bạn có thể ghi lại cảm xúc trong ngày, mức
                độ căng thẳng, giấc ngủ, chế độ ăn uống hoặc bất kỳ điều gì ảnh
                hưởng đến sức khỏe. Đây là cách để bạn hiểu được ảnh hưởng của
                các yếu tố bên ngoài đến cơ thể mình.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>💊 Chọn triệu chứng:</b> Tick vào các triệu chứng bạn đang
                gặp như:
                <ul style={{ marginTop: 6, marginLeft: 20 }}>
                  <li>Đau bụng kinh, mệt mỏi, đau đầu, nổi mụn</li>
                  <li>
                    Căng tức ngực, chướng bụng, tiêu chảy, thay đổi tâm trạng
                  </li>
                  <li>Khác (tuỳ chọn thêm của bạn)</li>
                </ul>
                Việc ghi nhận triệu chứng thường xuyên sẽ giúp hệ thống đưa ra
                gợi ý cải thiện sức khỏe phù hợp với bạn.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>💾 Lưu lại thông tin:</b> Sau khi nhập xong, nhấn "Lưu thay
                đổi" để lưu dữ liệu. Nếu bạn muốn xoá thông tin của ngày đó, hãy
                chọn "Xóa ngày này".
              </li>
              <li style={{ marginBottom: 12 }}>
                <b> Xem dự đoán và gợi ý:</b> Hệ thống sẽ dựa trên dữ liệu của
                bạn để:
                <ul style={{ marginTop: 6, marginLeft: 20 }}>
                  <li>Dự đoán ngày rụng trứng và kỳ kinh tiếp theo</li>
                  <li>Cảnh báo chu kỳ bất thường</li>
                  <li>Đưa ra lời khuyên chăm sóc sức khỏe cá nhân hóa</li>
                </ul>
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>📈 Xem lịch sử và thống kê:</b> Bạn có thể theo dõi biểu đồ
                chu kỳ và triệu chứng theo tháng để quan sát sự thay đổi của cơ
                thể qua thời gian. Đây là công cụ hữu ích nếu bạn đang quan tâm
                đến sức khỏe sinh sản, muốn mang thai, hoặc đang điều trị bệnh
                lý phụ khoa.
              </li>
              <li style={{ marginBottom: 12 }}>
                <b>⚠️ Lưu ý:</b> Dữ liệu của bạn được lưu trên hệ thống. Hãy ghi
                chú đều đặn để không bị mất dữ liệu khi đổi thiết bị.
              </li>
            </ol>

            <div style={{ marginTop: 20, color: "#555", fontSize: 14 }}>
              <b>🌟 Mẹo nhỏ:</b> Theo dõi chu kỳ không chỉ giúp bạn biết khi nào
              đến kỳ, mà còn giúp bạn hiểu rõ về cơ thể, cảm xúc, và sức khỏe
              tổng quát. Ghi chú đều đặn mỗi ngày để nhận được các dự đoán và
              lời khuyên cá nhân hóa chính xác nhất.
            </div>
          </div>
        </div>
      )}
      <div className="tracker-notifications">{renderNotifications()}</div>
      <div className="tracker-body">
        <div className="calendar-section">
          <Calendar
            predictions={predictions}
            onDayClick={handleDayClick}
            logs={userData.logs}
          />
        </div>
        <div className="info-section">
          <h2>Thông tin dự đoán</h2>
          {predictions ? (
            <div className="info-card">
              <button
                className="button-secondary"
                style={{ margin: "12px 0 0 0" }}
                onClick={() => setShowSymptomStatsModal(true)}
              >
                Xem thống kê triệu chứng tháng này
              </button>

              {showSymptomStatsModal && (
                <div
                  className="modal-overlay"
                  onClick={() => setShowSymptomStatsModal(false)}
                >
                  <div
                    className="modal-content"
                    style={{ maxWidth: 400 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="modal-close-button"
                      onClick={() => setShowSymptomStatsModal(false)}
                      aria-label="Đóng"
                    >
                      ×
                    </button>
                    <h2
                      style={{
                        textAlign: "center",
                        color: "#4f46e5",
                        fontWeight: 800,
                        fontSize: "1.3rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Thống kê triệu chứng tháng này
                    </h2>
                    {chartData.length > 0 && (
                      <div
                        style={{ width: "100%", height: 260, marginBottom: 18 }}
                      >
                        <ResponsiveContainer>
                          <BarChart
                            data={chartData.map((item) => ({
                              ...item,
                              name:
                                SYMPTOM_LABELS[item.symptom] || item.symptom,
                            }))}
                            layout="vertical"
                            margin={{ left: 20, right: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={120} />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#6366f1"
                              radius={[6, 6, 6, 6]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        margin: "12px 0",
                      }}
                    >
                      <label>
                        Từ:
                        <input
                          type="date"
                          value={filterStart}
                          onChange={(e) => setFilterStart(e.target.value)}
                          style={{ marginLeft: 6 }}
                        />
                      </label>
                      <label>
                        Đến:
                        <input
                          type="date"
                          value={filterEnd}
                          onChange={(e) => setFilterEnd(e.target.value)}
                          style={{ marginLeft: 6 }}
                        />
                      </label>
                    </div>
                    <hr
                      style={{
                        border: "none",
                        borderTop: "1.5px solid #e5e7eb",
                        margin: "0 0 10px 0",
                      }}
                    />
                    <table
                      className="period-history-table"
                      style={{ margin: "0 auto" }}
                    >
                      <thead>
                        <tr>
                          <th>Triệu chứng</th>
                          <th>Số lần</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(filteredSymptomStats).length === 0 && (
                          <tr>
                            <td colSpan={2}>Chưa có dữ liệu.</td>
                          </tr>
                        )}
                        {Object.entries(filteredSymptomStats).map(
                          ([symptom, count]) => (
                            <tr key={symptom}>
                              <td>{SYMPTOM_LABELS[symptom] || symptom}</td>
                              <td style={{ textAlign: "center" }}>{count}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <button
                className="button-secondary"
                style={{ margin: "12px 0" }}
                onClick={() => setShowHistoryModal(true)}
              >
                Xem lịch sử kỳ kinh
              </button>
              {showHistoryModal && (
                <div
                  className="modal-overlay"
                  onClick={() => setShowHistoryModal(false)}
                >
                  <div
                    className="modal-content"
                    style={{ maxWidth: 700 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="modal-close-button"
                      onClick={() => setShowHistoryModal(false)}
                      aria-label="Đóng"
                    >
                      ×
                    </button>
                    <h2
                      style={{
                        textAlign: "center",
                        color: "#4f46e5",
                        fontWeight: 800,
                        fontSize: "1.5rem",
                        marginBottom: "0.5rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Lịch sử kỳ kinh
                    </h2>
                    <hr
                      style={{
                        border: "none",
                        borderTop: "1.5px solid #e5e7eb",
                        margin: "0 0 10px 0",
                      }}
                    />
                    <table className="period-history-table">
                      <thead>
                        <tr>
                          <th>Ngày bắt đầu</th>
                          <th>Số ngày</th>
                          <th>Ghi chú</th>
                          <th>Triệu chứng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.periodHistory.length === 0 && (
                          <tr>
                            <td colSpan={4}>Chưa có dữ liệu.</td>
                          </tr>
                        )}
                        {userData.periodHistory
                          .slice()
                          .sort((a, b) => new Date(b) - new Date(a))
                          .map((startDate) => {
                            const dateKey = format(startDate, "yyyy-MM-dd");
                            const log = userData.logs[dateKey] || {};
                            return (
                              <tr key={dateKey}>
                                <td>{format(startDate, "dd/MM/yyyy")}</td>
                                <td>{userData.avgPeriodLength}</td>
                                <td>{log.note || ""}</td>
                                <td>
                                  {(log.symptoms || [])
                                    .map((sym) => SYMPTOM_LABELS[sym] || sym)
                                    .join(", ")}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <p>
                Kỳ kinh tiếp theo:{" "}
                <strong>
                  {format(predictions.nextPeriodStart, "dd/MM/yyyy")}
                </strong>
              </p>
              <p>
                Ngày rụng trứng:{" "}
                <strong>
                  {format(predictions.ovulationDay, "dd/MM/yyyy")}
                </strong>
              </p>
              <p>
                Độ dài chu kỳ TB:{" "}
                <strong>{predictions.avgCycleLength} ngày</strong>
              </p>
              <label>
                Độ dài kỳ kinh TB:{" "}
                <input
                  type="number"
                  min={2}
                  max={15}
                  value={userData.avgPeriodLength}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      avgPeriodLength: Math.max(
                        2,
                        Math.min(15, Number(e.target.value))
                      ),
                    }))
                  }
                  style={{ width: 50, marginLeft: 8 }}
                />{" "}
                ngày
              </label>

              <p>
                Số kỳ kinh đã ghi nhận:{" "}
                <strong>{userData.periodHistory.length}</strong>
              </p>
              <p>
                Số ngày có ghi chú:{" "}
                <strong>{Object.keys(userData.logs).length}</strong>
              </p>
              <p>
                Số ngày có triệu chứng:{" "}
                <strong>
                  {
                    Object.values(userData.logs).filter(
                      (log) => log.symptoms && log.symptoms.length > 0
                    ).length
                  }
                </strong>
              </p>
            </div>
          ) : (
            <p>Chưa đủ dữ liệu để dự đoán.</p>
          )}
          <div className="legend">
            <h3>Chú thích</h3>
            <ul>
              <li>
                <span className="legend-color period"></span> Ngày có kinh
              </li>
              <li>
                <span className="legend-color predicted"></span> Ngày kinh dự
                đoán
              </li>
              <li>
                <span className="legend-color ovulation"></span> Ngày rụng trứng
              </li>
              <li>
                <span className="legend-dot"></span> Ngày có ghi chú
              </li>
              <li>
                <span className="legend-color today"></span> Hôm nay
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleTracker;
