export const SYMPTOM_OPTIONS = [
  { value: "STOMACH_PAIN", label: "Đau bụng", icon: "🤕" },
  { value: "FATIGUE", label: "Mệt mỏi", icon: "😴" },
  { value: "HEADACHE", label: "Đau đầu", icon: "🤯" },
  { value: "ACNE", label: "Nổi mụn", icon: "😣" },
  { value: "BREAST_TENDERNESS", label: "Căng ngực", icon: "😖" },
  { value: "BLOATING", label: "Chướng bụng", icon: "😵" },
  { value: "DIARRHEA", label: "Tiêu chảy", icon: "🚽" },
  { value: "MOOD_SWING", label: "Thay đổi tâm trạng", icon: "😶‍🌫️" },
];

export const SYMPTOM_LABELS = Object.fromEntries(
  SYMPTOM_OPTIONS.map(({ value, label }) => [value, label])
);

export const SYMPTOM_ENUM_MAP = Object.fromEntries(
  SYMPTOM_OPTIONS.map(({ value, label }) => [label, value])
);
