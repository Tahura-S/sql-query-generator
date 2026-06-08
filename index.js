const express = require("express");
const path = require("path");
require("dotenv").config();

const sqlRoutes = require("./routes/sqlRoutes");

const app = express();
const port = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use(sqlRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
