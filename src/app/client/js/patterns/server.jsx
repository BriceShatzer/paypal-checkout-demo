
import React from 'react';

export let server = {

    slug: 'server',

    name: `Server`,

    fullName: `Server integration`,

    intro: (
        <p>Create horizontal <b>Smart Payment Buttons which call your server</b></p>
    ),

    code: (ctx) => `
        <!DOCTYPE html>

        <head>
            <!-- Add meta tags for mobile and IE -->
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        </head>

        <body>
            <!-- Set up a container element for the button -->
            <div id="paypal-button-container"></div>

            <!-- Include the PayPal JavaScript SDK -->
            <script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD"></script>

            <script>
                // Render the PayPal button into #paypal-button-container
                paypal.Buttons({

                    // Call your server to set up the transaction
                    createOrder: function(data, actions) {
                        return fetch('/demo/checkout/api/paypal/order/create/', {
                            method: 'post'
                        }).then(function(res) {
                            return res.json();
                        }).then(function(serverData) {
                            return serverData.id;
                        });
                    },

                    // Call your server to finalize the transaction
                    onApprove: function(data, actions) {
                        return fetch('/demo/checkout/api/paypal/order/' + data.orderID + '/capture/', {
                            method: 'post'
                        }).then(function(res) {
                            return res.json();
                        }).then(function(serverData) {
                            // Three cases to handle:
                            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                            //   (2) Other non-recoverable errors -> Show a failure message
                            //   (3) Successful transaction -> Show confirmation or thank you

                            // This example reads a v2/checkout/orders capture response, propagated from the server
                            // You could use a different API or structure for your 'serverData'
                            var errorDetail = Array.isArray(serverData.details) && serverData.details[0];

                            if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED') {
                                return actions.restart(); // Recoverable state, per:
                                // https://developer.paypal.com/docs/checkout/integration-features/funding-failure/
                            }

                            if (errorDetail) {
                                var msg = 'Sorry, your transaction could not be processed.';
                                if (errorDetail.description) msg += '\\n\\n' + errorDetail.description;
                                if (serverData.debug_id) msg += ' (' + serverData.debug_id + ')';
                                return alert(msg); // Show a failure message
                            }

                            // Show a success message
                            alert('Transaction completed by ' + serverData.payer.name.given_name);
                        });
                    }

                }).render('#paypal-button-container');
            </script>
        </body>
    `
};
