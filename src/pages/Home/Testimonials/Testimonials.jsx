import React, { useState, useEffect, useRef } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import doctor1 from "../../../assets/images/doctor1.jpg";
import TESTIMONIAL_MESSAGES from "./testimonialsMessages";
import { getConsultants } from "../../../features/catalog/catalogApi";
import "./Testimonials.css";

const Testimonials = () => {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const splideRef = useRef(null);
  const navigate = useNavigate();

  // Fetch consultants from API
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const response = await getConsultants();
        setConsultants(response.data || []);
      } catch {
        message.error(TESTIMONIAL_MESSAGES.LOAD_FAILED);
        setConsultants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  // Handle consultation booking
  const handleConsultation = () => {
    // Điều hướng sang trang dịch vụ và cuộn lên đầu trang
    navigate("/services");
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <section className="doctors-section section">
        <div className="container">
          <h3 className="doctors-section-title">{TESTIMONIAL_MESSAGES.TITLE}</h3>
          <p className="section-subtitle-description">
            {TESTIMONIAL_MESSAGES.LOADING}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="doctors-section section">
      <div className="container">
        <h3 className="doctors-section-title">{TESTIMONIAL_MESSAGES.TITLE}</h3>
        <p className="section-subtitle-description">
          {TESTIMONIAL_MESSAGES.DESCRIPTION}
        </p>

        {consultants.length > 0 ? (
          <Splide
            ref={splideRef}
            options={{
              type: "loop",
              gap: "0px",
              perPage: 3,
              pagination: false,
              arrows: false,
              autoScroll: {
                speed: 5,
              },
              breakpoints: {
                1024: {
                  perPage: 2,
                  gap: "0px",
                },
                640: {
                  perPage: 1,
                  gap: "0px",
                },
              },
            }}
            extensions={{ AutoScroll }}
            aria-label={TESTIMONIAL_MESSAGES.CAROUSEL_LABEL}
            className="testimonials-splide"
          >
            {consultants.map((consultant) => (
              <SplideSlide key={consultant.id}>
                <div className="doctor-card">
                  <div className="doctor-content">
                    <div className="doctor-avatar">
                      <img
                        src={consultant.imageUrl || consultant.img || doctor1}
                        alt={consultant.fullname || TESTIMONIAL_MESSAGES.UNKNOWN_NAME}
                      />
                    </div>
                    <div className="doctor-stats">
                      <div className="rating-section">
                        <span className="rating-display">
                          ⭐ {consultant.rating?.toFixed(1) || "0.0"}/5
                        </span>
                      </div>
                      <div className="views-section"></div>
                    </div>
                    <div className="doctor-info">
                      <h3 className="doctor-name">
                        {consultant.fullname || TESTIMONIAL_MESSAGES.UNKNOWN_NAME}
                      </h3>
                      <p className="doctor-title">
                        {consultant.specializationNames ||
                          TESTIMONIAL_MESSAGES.UNKNOWN_SPECIALIZATION}
                      </p>
                      <div className="doctor-details">
                        <div className="specialist-badge">
                          <span>{TESTIMONIAL_MESSAGES.HEALTHCARE_SPECIALTY}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="consult-btn"
                    onClick={() => handleConsultation(consultant)}
                  >
                    {TESTIMONIAL_MESSAGES.VIEW_SERVICES}
                  </button>
                </div>
              </SplideSlide>
            ))}
          </Splide>
        ) : (
          <div className="no-consultants">
            <p>{TESTIMONIAL_MESSAGES.EMPTY}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
