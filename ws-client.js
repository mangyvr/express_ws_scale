// pass in the ws object of ws-server to send message on the new server
let wsClient = function (scaleData, tareValue, scaleSm, ws) {

  ws.on('open', function open() {
    console.log('WS scale connected');
  });

  ws.on('message', function incoming(data, flags) {
    // console.log(data.match(scaleRe)[0]);
    //Keep scaleData at 1023
    scaleData.shift();
    let currWeight = data.match( /(-)?\d+\.\d+/)[0];
    scaleData.push(currWeight);

    //average -- not sure if necessary
    let average = 0;
    let avgLength = 10;
    scaleData.slice(scaleData.length - avgLength).forEach( (data) => {
      average += parseFloat(data);
    });
    average = average/avgLength;

    scaleSm.setNextState(average);
    if ( scaleSm.transitionReady() ) {
      scaleSm.transition();
    }
    // console.log(`weight: ${currWeight}`);
    // console.log(`currState: ${scaleSm.getCurrState()}`);
    // console.log(`nextState: ${scaleSm.getNextState()}`);
  });

  ws.on('close', function close() {
    console.log('WS scale closed');
  });

  process.on('SIGINT', function() {
    console.log('Closing WS connection.');
    ws.close();
    process.exit();
  });
};

module.exports = wsClient;
