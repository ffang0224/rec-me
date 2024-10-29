const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// DISCLAIMER: Various parts of this server code have been created with Claude AI. 
// All parts have been modified manually. 

// The parts created by Claude AI are marked with a comment.

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/api/recommendations", async (req, res) => {
  try {
    const { q, type } = req.query;

    const apiKey = process.env.TASTEDIVE_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "API key not configured on server" });
    }

    console.log("Making request with params:", {
      q,
      type,
      k: apiKey,
      info: 1,
      limit: 20,
    });

    // This part has been created with Claude AI.
    const response = await axios({
      method: "get",
      url: "https://tastedive.com/api/similar",
      params: {
        q,
        type,
        k: apiKey,
        info: 1,
        limit: 20,
      },
      headers: {
        Accept: "application/json",
      },
    });

    //console.log("API Response Status:", response.status);
    //console.log("API Response Data:", JSON.stringify(response.data, null, 2));

    // Check if the response is a valid JSON object
    if (!response.data) {
      return res.status(500).json({
        error: "Invalid API response format",
        details: "Response is not a valid JSON object",
      });
    }

    // Check if the response contains a "Similar" property
    if (!response.data["similar"]) {
      return res.status(500).json({
        error: "Invalid API response format",
        details: "Response is missing Similar property",
        response: response.data,
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Check if the error is due to an invalid/nonexistent API key
    if (error.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Check if the error is due to API key quota exceeded or access denied (limit of 300 requests per hour)
    if (error.response?.status === 403) {
      return res
        .status(403)
        .json({ error: "API key quota exceeded or access denied" });
    }

    // 500 status code for all other errors
    res.status(500).json({
      error: "Failed to fetch recommendations",
      details: error.message,
      apiResponse: error.response?.data,
    });
  }
});


// Open 3001 port for the server. If needed to specify, modify a .env file at rec-me/rec-me/server.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
