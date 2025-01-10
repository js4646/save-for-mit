"use strict";
//Import packages
const express = require("express"); // Express Server
const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const { url } = require("inspector");

// Initialize
const app = express();
dotenv.config();

// Init variables
const PORT = 3342;
const apiKey = process.env.MERCHANT_API_KEY;
const apiSecret = process.env.MERCHANT_API_SECRET;

// Use middleware to serve files from the 'dist/publicAppRevolut' directory
app.use(express.static(path.join(__dirname, "dist/publicAppRevolut")));

// Endpoint - /createorder
app.post("/createorder", express.json(), async (req, res) => {
  console.log("Create order called");
  try {
    let { orderPrice } = req.body;
    //Wait for the prosime fullfilled
    const orderResponse = await merchantServicesCreateOrder(orderPrice * 100);
    res.send(orderResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Order failed to create",
    });
  }
});

//Endpoint /order-details
app.get("/order-detials", express.json(), async (req, res) => {
  try {
    const { orderId } = req.query;
    const orderResponse = await merchantServicesGetOrder(orderId);
    //    console.log(orderResponse);
    if (!orderResponse) return res.status(404).send("Checkout URL not found");
    res.send(orderResponse);
  } catch (error) {
    console.error("Error fetching checkout URL:", error);
    res.status(500).send("Failed to fetch checkout URL");
  }
});

// -------- merchantServices -----------
const getOrderConfigObj = function (httpMethod, endpoint) {
  let config = {
    method: `${httpMethod}`,
    maxBodyLength: Infinity,
    url: `https://sandbox-merchant.revolut.com/api${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiSecret}`,
      "Revolut-Api-Version": "2023-09-01",
    },
  };
  return config;
};

const merchantServicesGetOrder = async function (orderId) {
  // Config for the post request
  const config = getOrderConfigObj("get", `/orders/${orderId}`);
  try {
    const response = await axios(config); // Await the promise and get the response
    console.log(JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// Async function to create an order - price can be specified
const merchantServicesCreateOrder = async function (price = 100) {
  let data = JSON.stringify({
    amount: price,
    currency: "GBP",
    customer: {
      id: "118ab054-4806-4e52-894e-d803b3d8d292",
    },
    merchant_order_data: {
      url: "https://example.com/orders/12345",
      reference: "Ref1 - Magnifincent!",
    },
  });

  // Config for the post request
  const config = getOrderConfigObj("post", "/orders");
  config.data = data;

  try {
    const response = await axios(config); // Await the promise and get the response
    console.log(JSON.stringify(response.data));
    return JSON.stringify({
      token: response.data.token, //Token is need to create an cart field in the webpage
      orderId: response.data.id,
      checkout_url: response.data.checkout_url,
    }); // Return the resolved data
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
