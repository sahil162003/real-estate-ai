
import api from "../client";

const applyForAgent = async (reason) => {
  const response = await api.post("/api/customer/applyForAgent", {
    reason,
  });

  return response.data;
};

const getMyApplicationStatus = async () => {
  const response = await api.get("/api/customer/myAgentApplication");
  return response.data;
};

const getPendingApplications = async () => {
  const response = await api.get("/api/admin/getApplication");
  return response.data;
};

const approveApplication = async (applicationId) => {
  const response = await api.post(
    `/api/admin/approveApplication/${applicationId}`
  );

  return response.data;
};

const rejectApplication = async (applicationId) => {
  const response = await api.post(
    `/api/admin/rejectApplication/${applicationId}`
  );

  return response.data;
};

export default {
  applyForAgent,
  getMyApplicationStatus,
  getPendingApplications,
  approveApplication,
  rejectApplication,
};
