import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getServices,
  getServiceAverageRating,
} from "../../../catalog/catalogApi";
import SERVICE_MESSAGES from "../serviceMessages";
import {
  CONSULTING_SERVICE_TYPES,
  SERVICE_TABS,
} from "./ServiceList.constants";
import "./ServiceList.css";

const StarRating = ({ rating }) => {
  const roundedRating = Math.round(rating);

  return (
    <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= roundedRating ? "star filled" : "star"}>
          *
        </span>
      ))}
    </div>
  );
};

const getFilteredServices = (services, searchTerm, activeTab) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const servicesByName = services.filter((service) =>
    (service.name || "").toLowerCase().includes(normalizedSearch)
  );

  switch (activeTab) {
    case "CONSULTING":
      return servicesByName.filter(
        (service) =>
          CONSULTING_SERVICE_TYPES.includes(service.type) &&
          !service.isCombo
      );
    case "TESTING":
      return servicesByName.filter(
        (service) => service.type?.startsWith("TESTING") && !service.isCombo
      );
    case "COMBO":
      return servicesByName.filter((service) => service.isCombo === true);
    default:
      return servicesByName;
  }
};

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [serviceRatings, setServiceRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await getServices();
        setServices(Array.isArray(response.data) ? response.data : []);
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    const loadRatings = async () => {
      const ratings = await Promise.all(
        services.map(async (service) => {
          try {
            const response = await getServiceAverageRating(service.id);
            return [
              service.id,
              {
                averageRating: Number(response.data?.averageRating || 0),
                totalRatings: Number(response.data?.totalAppointment || 0),
              },
            ];
          } catch {
            return [service.id, { averageRating: 0, totalRatings: 0 }];
          }
        })
      );

      setServiceRatings(Object.fromEntries(ratings));
    };

    if (services.length > 0) {
      loadRatings();
    }
  }, [services]);

  const visibleServices = getFilteredServices(services, searchTerm, activeTab);

  return (
    <div className="service-page-container">
      <div className="service-search-box">
        <input
          type="text"
          placeholder={SERVICE_MESSAGES.SEARCH_PLACEHOLDER}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="service-tab-buttons">
        {Object.entries(SERVICE_TABS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`service-tab-button ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleServices.length === 0 ? (
        <p>{SERVICE_MESSAGES.EMPTY}</p>
      ) : (
        <div className="service-list-wrapper">
          {visibleServices.map((service) => {
            const isCombo = service.isCombo === true;
            const discount = Number(service.discountPercent || 0);
            const basePrice = Number(service.price || 0);
            const originalPrice = isCombo && Array.isArray(service.subServices)
              ? service.subServices.reduce((sum, item) => sum + Number(item.price || 0), 0)
              : basePrice;
            const finalPrice = isCombo
              ? basePrice
              : basePrice * (1 - discount / 100);
            const rating = serviceRatings[service.id] || {
              averageRating: 0,
              totalRatings: 0,
            };

            return (
              <article
                key={service.id}
                className={`service-card ${isCombo ? "combo" : ""}`}
              >
                <div className="service-card-content">
                  <div className="left-info">
                    <div className="service-name-container">
                      <h3 className="service-name">{service.name}</h3>
                      {service.type === "CONSULTING_ON" && (
                        <span className="online-tag">Online</span>
                      )}
                    </div>
                    <p className="desc">{service.description}</p>
                    <div className="price-block">
                      {discount > 0 && !isCombo ? (
                        <>
                          <p>
                            <span>{SERVICE_MESSAGES.ORIGINAL_PRICE}:</span>{" "}
                            <span className="original-price">
                              {originalPrice.toLocaleString()} VND
                            </span>
                          </p>
                          <p>
                            <strong>{SERVICE_MESSAGES.DISCOUNTED_PRICE}:</strong>{" "}
                            <span className="price-highlight">
                              {finalPrice.toLocaleString()} VND
                            </span>
                          </p>
                        </>
                      ) : (
                        <p>
                          <strong>{SERVICE_MESSAGES.PRICE}:</strong>{" "}
                          <span className="price-highlight">
                            {finalPrice.toLocaleString()} VND
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="right-action">
                    <Button
                      className="booking-button"
                      onClick={() => navigate(`/service-detail/${service.id}`)}
                    >
                      <span>{SERVICE_MESSAGES.BOOK}</span>
                    </Button>
                    <div className="service-rating">
                      <StarRating rating={rating.averageRating} />
                      <span className="rating-text">
                        {rating.averageRating.toFixed(1)} ({rating.totalRatings})
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceList;
