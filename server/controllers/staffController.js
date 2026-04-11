import { getStaffByDept } from "../utils/getStaffByDept.js";

export const getStaffByDepartment = (req, res) => {
  try {
    const { department } = req.params;
    const staff = getStaffByDept(department);

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
