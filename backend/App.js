require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/connectdb");
const userRoutes = require("./routes/user.routes");
const storeRoutes = require("./routes/store.routes");
const dashboredRoutes = require("./routes/dashbored.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// db connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admin", dashboredRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
