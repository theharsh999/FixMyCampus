import { staffData } from "../data/staffData.js";

export const getStaffByDept = (department) => {
  return staffData[department] || [];
};
