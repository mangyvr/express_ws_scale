# express_ws_scale

Node.js Server for Coffee Sensr

This combined WebSocket/Express.js server requires a Raspberry Pi.  The Raspberry Pi has a load cell connected via an ADC/gain amplifier to GPIO pins.  There is a Node.js WebSocket server running on the Raspberry Pi, and it broadcasts the weight to any clients connected. The server hosted here listens to these messages and passes the weight information to a state machine, which makes a determination what the event (if any) that just occurred.  A WebSocket server here then sends the event information to the front end.  The front end is also able to send messages to this WebSocket server and request past event information from the Postgres DB.

Usage

Connect the Raspberry Pi with the load cell to a LAN.  Make sure the WS server is running, and that the IP address is the same as the address listed in ws-client.js.  Then start the Node.js server.
