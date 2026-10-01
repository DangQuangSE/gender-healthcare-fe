const toConsultantId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

export const resolveConsultantSnapshot = (primary, fallback = null) => {
  const source = primary?.id !== undefined && primary?.id !== null
    ? primary
    : fallback;
  const id = toConsultantId(source?.id ?? source?.consultantId);

  if (id === null) {
    return null;
  }

  return {
    id,
    name: source.name ?? source.fullname ?? null,
    specialization: source.specialization ?? source.specializationName ?? null,
  };
};

export const buildBookingPreview = (booking) => {
  const consultant = resolveConsultantSnapshot(
    booking.consultant,
    booking.consultantId
      ? {
          id: booking.consultantId,
          name: booking.consultantName,
          specialization: booking.consultantSpecialization,
        }
      : null,
  );

  return {
    ...booking,
    consultant,
    consultantId: consultant?.id ?? null,
  };
};

