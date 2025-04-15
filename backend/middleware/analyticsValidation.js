export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (startDate && isNaN(Date.parse(startDate))) {
    return res.status(400).json({
      success: false,
      error: "Invalid startDate format (use YYYY-MM-DD)",
    });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return res.status(400).json({
      success: false,
      error: "Invalid endDate format (use YYYY-MM-DD)",
    });
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      error: "startDate must be before endDate",
    });
  }

  next();
};
