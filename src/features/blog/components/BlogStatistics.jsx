import React from "react";
import { STATISTICS } from "./BlogStatistics.constants";

const BlogStatistics = ({ values }) => (
  <div className="stats-grid">
    {STATISTICS.map(({ key, label, className }) => (
      <div key={key} className={`stats-card ${className}`}>
        <div className="stats-label">{label}</div>
        <div className={`stats-number ${className}`}>{values[key]}</div>
      </div>
    ))}
  </div>
);

export default BlogStatistics;
