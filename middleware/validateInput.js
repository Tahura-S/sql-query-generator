const validateInput = (req, res, next) => {
  const { schema, question } = req.body;

  if (!schema || typeof schema !== 'string' || schema.trim().length === 0) {
    return res.status(400).json({
      error: true,
      field: "schema",
      message: "Schema is required and cannot be empty."
    });
  }

  if (schema.trim().length < 10) {
    return res.status(400).json({
      error: true,
      field: "schema",
      message: "Schema must be at least 10 characters long."
    });
  }

  if (!schema.toUpperCase().includes('CREATE TABLE') && !schema.toUpperCase().includes('TABLE')) {
    return res.status(400).json({
      error: true,
      field: "schema",
      message: "Schema must contain a CREATE TABLE statement."
    });
  }

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({
      error: true,
      field: "question",
      message: "Question is required and cannot be empty."
    });
  }

  if (question.trim().length < 5) {
    return res.status(400).json({
      error: true,
      field: "question",
      message: "Question must be at least 5 characters long."
    });
  }

  if (question.trim().length > 300) {
    return res.status(400).json({
      error: true,
      field: "question",
      message: "Question cannot exceed 300 characters."
    });
  }

  next();
};

module.exports = validateInput;
