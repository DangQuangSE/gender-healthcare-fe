export const CYCLE_TRACKER_MESSAGES = {
  LOGIN_REQUIRED: "Bạn chưa đăng nhập hoặc thông tin đăng nhập chưa sẵn sàng!",
  LOG_SAVE_SUCCESS: "Lưu nhật ký thành công!",
  LOG_SAVE_FAILED: "Không thể lưu log. Vui lòng thử lại sau.",
  RECOMMENDATIONS: {
    NEXT_PERIOD_PREP: `🔁 Sắp đến kỳ kinh:
      1. Chuẩn bị sẵn các vật dụng vệ sinh cá nhân như băng vệ sinh, cốc nguyệt san, giấy vệ sinh sạch.
      2. Đảm bảo có sẵn thuốc giảm đau bụng kinh (nếu thường xuyên đau).
      3. Chuẩn bị nước ấm hoặc túi chườm để giảm đau bụng nếu cần.
      4. Lên kế hoạch nghỉ ngơi hợp lý, tránh vận động mạnh vào những ngày đầu kỳ kinh.
      5. Ghi chú lại các triệu chứng bất thường nếu xuất hiện.`,
    OVULATION_PREP: `🔁 Sắp đến ngày rụng trứng:
      1. Nếu bạn muốn mang thai, hãy chuẩn bị sức khỏe tốt nhất: ăn uống đủ chất, ngủ đủ giấc.
      2. Theo dõi các dấu hiệu rụng trứng như dịch nhầy cổ tử cung trong, dai, nhiệt độ cơ thể tăng nhẹ.
      3. Lên kế hoạch quan hệ vợ chồng trong những ngày này để tăng khả năng thụ thai.
      4. Nếu không muốn mang thai, hãy sử dụng biện pháp bảo vệ an toàn.`,
    NEXT_PERIOD_PREDICTION: (date) => `🔁 Dự đoán kỳ kinh tiếp theo: ${date}.
    - Hãy ghi chú lại ngày bắt đầu và kết thúc kỳ kinh để hệ thống dự đoán chính xác hơn cho các chu kỳ sau.`,
    FATIGUE: `🧠 Bạn có dấu hiệu mệt mỏi:
      1. Ưu tiên nghỉ ngơi, ngủ đủ 7-8 tiếng mỗi ngày.
      2. Uống đủ nước (1.5-2 lít/ngày).
      3. Ăn các thực phẩm giàu vitamin và khoáng chất như trái cây, rau xanh.
      4. Tránh làm việc quá sức, giảm stress bằng thiền hoặc nghe nhạc nhẹ.
      5. Nếu mệt mỏi kéo dài nhiều ngày, hãy cân nhắc đi khám bác sĩ.`,
    PERIOD_PAIN: `🧠 Đau bụng kinh:
      1. Sử dụng túi chườm ấm đặt lên bụng dưới để giảm đau.
      2. Massage nhẹ nhàng vùng bụng.
      3. Uống nước ấm, tránh đồ uống lạnh hoặc có gas.
      4. Nếu đau dữ dội, có thể dùng thuốc giảm đau theo chỉ dẫn của bác sĩ.
      5. Ghi chú lại mức độ đau để theo dõi qua các kỳ kinh.`,
    ABNORMAL_CYCLE: `🧠 Chu kỳ của bạn có dấu hiệu bất thường:
      1. Theo dõi sát các triệu chứng lạ như ra máu kéo dài, đau bụng dữ dội, kinh nguyệt không đều.
      2. Ghi chú lại các bất thường trong ứng dụng.
      3. Nếu tình trạng kéo dài hoặc có dấu hiệu nghiêm trọng, hãy đi khám phụ khoa để được tư vấn.`,
    FERTILE_WINDOW: `🧬 Đây là "cửa sổ sinh sản" (fertile window) – thời điểm dễ thụ thai nhất:
      1. Lên kế hoạch quan hệ đều đặn trong 5 ngày trước và 1 ngày sau ngày rụng trứng.
      2. Theo dõi thêm các dấu hiệu rụng trứng: dịch nhầy cổ tử cung trong, nhiệt độ cơ thể tăng nhẹ.
      3. Ăn uống đủ chất, bổ sung axit folic, tránh rượu bia và thuốc lá.
      4. Giữ tinh thần thoải mái, tránh căng thẳng để tăng khả năng thụ thai.`,
    OVULATION_SIGNS: `🧬 Theo dõi các dấu hiệu rụng trứng:
      - Đo nhiệt độ cơ thể mỗi sáng.
      - Quan sát dịch nhầy cổ tử cung.
      - Sử dụng que thử rụng trứng nếu cần.`,
    HIGH_FERTILITY: ` Những ngày này có nguy cơ thụ thai cao:
      1. Nếu bạn muốn tránh thai tự nhiên, hãy tránh quan hệ hoặc sử dụng bao cao su.
      2. Theo dõi sát các dấu hiệu rụng trứng để xác định ngày an toàn.
      3. Ghi chú lại các ngày quan hệ để kiểm soát tốt hơn.`,
    HEALTHY_LIFESTYLE: `🧘 Lối sống lành mạnh trong kỳ kinh:
      1. Tập yoga nhẹ nhàng, đi bộ hoặc các bài tập giãn cơ để giảm khó chịu.
      2. Bổ sung thực phẩm giàu sắt (thịt đỏ, gan, rau xanh), uống nhiều nước.
      3. Tránh đồ ăn cay nóng, nhiều dầu mỡ.
      4. Nghỉ ngơi hợp lý, tránh thức khuya.
      5. Ghi chú lại các triệu chứng để theo dõi sức khỏe lâu dài.`,
    LOG_PROMPT: `💡 Hãy ghi chú lại các triệu chứng hoặc cảm xúc của bạn:
      1. Nhấn vào ngày trên lịch để thêm ghi chú hoặc triệu chứng.
      2. Việc ghi chú đều đặn giúp hệ thống dự đoán chính xác hơn và đưa ra gợi ý phù hợp với bạn.
      3. Theo dõi sức khỏe bản thân tốt hơn qua từng chu kỳ.`,
  },

};

export default CYCLE_TRACKER_MESSAGES;

