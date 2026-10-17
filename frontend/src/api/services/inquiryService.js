
import api from "../client";

const sendInquiry = async (propertyId, connect) => {
  const response = await api.post(
    `/api/customer/PropertyInquiry/${propertyId}`,
    null,
    {
      params: { connect },
    }
  );

  return response.data;
};

const getMyInquiries = async () => {
  const response = await api.get("/api/customer/inquiries");
  return response.data;
};

const getInquiryById = async (inquiryId) => {
  const response = await api.get(
    `/api/customer/inquiry/${inquiryId}`
  );

  return response.data;
};

const inquiryService = {
  sendInquiry,
  getMyInquiries,
  getInquiryById,
};

export default inquiryService;
