import { useCallback, useEffect, useState } from "react";
import {
  deleteCertification,
  getCurrentUser,
  getMyCertifications,
  updateAvatar,
  updateProfile,
} from "../../../features/profile/profileApi";
import { toProfileFormValues } from "./Profile.constants";

const toProfilePayload = (values) => ({
  fullname: values.fullname,
  phone: values.phone,
  address: values.address,
  gender: values.gender,
  dateOfBirth: values.dateOfBirth
    ? values.dateOfBirth.format("YYYY-MM-DD")
    : null,
});

const unwrapResponseData = (response) => response?.data ?? response;

export const useProfileData = (form) => {
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [fetchingUser, setFetchingUser] = useState(true);

  const applyUser = useCallback(
    (nextUser) => {
      setUser(nextUser);
      setImageUrl(nextUser?.imageUrl || "");
      form.setFieldsValue(toProfileFormValues(nextUser));
      if (nextUser?.certificates) {
        setCertificates(nextUser.certificates);
      }
    },
    [form]
  );

  const loadUser = useCallback(async () => {
    setFetchingUser(true);
    try {
      const response = await getCurrentUser();
      const nextUser = unwrapResponseData(response);
      applyUser(nextUser);
      return nextUser;
    } finally {
      setFetchingUser(false);
    }
  }, [applyUser]);

  const saveProfile = useCallback(
    async (values) => {
      await updateProfile(toProfilePayload(values));
      return loadUser();
    },
    [loadUser]
  );

  const uploadProfileAvatar = useCallback(async (file) => {
    const response = await updateAvatar(file);
    const updatedUser = unwrapResponseData(response);
    const nextImageUrl = updatedUser?.imageUrl || "";
    setImageUrl(nextImageUrl);
    setUser((currentUser) => ({ ...currentUser, imageUrl: nextImageUrl }));
    return nextImageUrl;
  }, []);

  const loadCertificates = useCallback(async () => {
    const response = await getMyCertifications();
    const data = unwrapResponseData(response);
    const nextCertificates = Array.isArray(data) ? data : data ? [data] : [];
    setCertificates(nextCertificates);
    return nextCertificates;
  }, []);

  const removeCertificate = useCallback(async (certificateId) => {
    await deleteCertification(certificateId);
    setCertificates((currentCertificates) =>
      currentCertificates.filter((certificate) => certificate.id !== certificateId)
    );
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user?.role === "CONSULTANT") {
      loadCertificates();
    }
  }, [loadCertificates, user]);

  return {
    user,
    setUser,
    imageUrl,
    certificates,
    setCertificates,
    fetchingUser,
    loadUser,
    saveProfile,
    uploadProfileAvatar,
    removeCertificate,
    loadCertificates,
  };
};
