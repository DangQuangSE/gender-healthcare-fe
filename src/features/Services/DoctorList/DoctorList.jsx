import { useCallback, useEffect, useState } from "react";
import { Button, message } from "antd";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { getConsultants } from "../../catalog/catalogApi";
import { DOCTOR_MESSAGES } from "./doctorMessages";
import { DOCTORS_PER_PAGE } from "./DoctorList.constants";
import "./DoctorList.css";

const DoctorList = () => {
  const [consultants, setConsultants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchConsultants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getConsultants();
      setConsultants(Array.isArray(response.data) ? response.data : []);
      setCurrentPage(1);
    } catch (error) {
      setConsultants([]);
      message.error(getApiErrorMessage(error, DOCTOR_MESSAGES.LOAD_FAILED));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants]);

  const totalPages = Math.ceil(consultants.length / DOCTORS_PER_PAGE);
  const startIndex = (currentPage - 1) * DOCTORS_PER_PAGE;
  const currentConsultants = consultants.slice(
    startIndex,
    startIndex + DOCTORS_PER_PAGE
  );

  return (
    <section aria-busy={loading}>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <Button onClick={fetchConsultants} loading={loading}>
          {DOCTOR_MESSAGES.REFRESH}
        </Button>
      </div>

      {currentConsultants.length === 0 && !loading ? (
        <p>{DOCTOR_MESSAGES.EMPTY}</p>
      ) : (
        <div className="doctor-list-container">
          {currentConsultants.map((consultant) => (
            <article key={consultant.id} className="doctor-card">
              {consultant.imageUrl ? (
                <img
                  src={consultant.imageUrl}
                  alt={consultant.fullname || DOCTOR_MESSAGES.UNKNOWN_NAME}
                  className="doctor-image"
                />
              ) : (
                <div className="doctor-image" aria-hidden="true" />
              )}
              <div className="doctor-info">
                <h3 className="doctor-name">
                  {consultant.fullname || DOCTOR_MESSAGES.UNKNOWN_NAME}
                </h3>
                <p className="doctor-specialty">
                  {consultant.specializationNames?.join(", ") ||
                    DOCTOR_MESSAGES.NO_SPECIALIZATION}
                </p>
                <p className="doctor-experience">
                  {consultant.email || DOCTOR_MESSAGES.NO_EMAIL}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination" aria-label={DOCTOR_MESSAGES.PAGINATION}>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="pagination-arrow"
            aria-label={DOCTOR_MESSAGES.PREVIOUS}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`pagination-number ${
                  currentPage === page ? "active" : ""
                }`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
            className="pagination-arrow"
            aria-label={DOCTOR_MESSAGES.NEXT}
          >
            &gt;
          </button>
        </div>
      )}
    </section>
  );
};

export default DoctorList;
