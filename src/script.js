"use strict";
import RevolutCheckout from "@revolut/checkout";

//Global Variables
let token = "";
let orderId = "";

//Payment processor object
const paymentProcessor = {};

//Successful payment
paymentProcessor.succesFullTransaction = async function () {
  console.log("success");
  document.getElementById("payment-status").innerText = "Payment Successful";
  document.getElementById("payment-status").style.color = "green";
  window.alert("Thank you for your purchase!");
};

//Failed payment
paymentProcessor.failedTransaction = function (error) {
  document.getElementById(
    "payment-status"
  ).innerText = `Payment failed: ${error}`;
  document.getElementById("payment-status").style.color = "red";
  window.alert(`Oeps somethin happend :(. ${error}`);
};

// Create PopUp field
paymentProcessor.createPopup = async function (token) {
  RevolutCheckout(token, "sandbox")
    .then((instance) => {
      instance.payWithPopup({
        savePaymentMethodFor: "merchant",
        onSuccess: () => {
          console.log(
            "success",
            "The credit card information has been successfully saved!"
          );
          this.succesFullTransaction();
        },
        onError: (error) => {
          console.log(
            "error",
            "There was an error whilst saving your card. Please try again."
          );
          this.failedTransaction(error);
        },
      });
    })
    .catch((error) => {
      console.error("Error initializing Revolut Checkout:", error);
    });
};

const createOrder = async function (price = 0) {
  // Post request send the Price, so backend
  // can create the order with the price variable
  const res = await fetch("/createorder", {
    method: "POST",
    maxBodyLength: Infinity,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderPrice: price,
    }),
  });

  // res will get value when promise is fullfilled
  // console.log(res);
  const orderResponse = await res.json(); // {token: '...', order_id: '...'}
  ({ token, orderId } = orderResponse);
  console.log(orderResponse);

  //Show order token and order_id in webpage
  document.getElementById(
    "order-info"
  ).innerHTML = `<b>Order has been created:</b><br>
                 - Token: ${orderResponse.token}<br>
                 - Order id: ${orderResponse.orderId}<br> 
                `;

  return orderResponse;
};

// Reference to price input element in the webpage
const orderPriceElement = document.getElementById("order-price");

// Eventlistener to create order
document
  .getElementById("button-create-order")
  .addEventListener("click", async () => {
    let { token } = await createOrder(orderPriceElement.value);
    paymentProcessor.createPopup(token);
  });
