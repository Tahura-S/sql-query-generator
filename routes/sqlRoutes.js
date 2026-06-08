const express = require("express");
const router = express.Router();
const { renderHome, generateSQLQuery } = require("../controllers/sqlController");
const validateInput = require("../middleware/validateInput");

router.get("/", renderHome);
router.post("/generate", validateInput, generateSQLQuery);

module.exports = router;
