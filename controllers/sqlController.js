const { generateSQL } = require("../services/sqlService");

const renderHome = (req, res) => {
  res.render("index");
};

const generateSQLQuery = async (req, res) => {
  const { schema, question } = req.body;

  try {
    const sql = await generateSQL(schema, question);
    res.json({ error: false, sql });
  } catch (error) {
    console.error("SQL generation error:", error);
    res.status(500).json({
      error: true,
      field: "general",
      message: "Server error. Failed to generate SQL. Check logs."
    });
  }
};

module.exports = { renderHome, generateSQLQuery };
