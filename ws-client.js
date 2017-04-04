// pass in the ws object of ws-server to send message on the new server
let wsClient = function ( scaleData, tareData, tareValue, scaleSm, ws ) {

  ws.on('open', function open() {
    console.log('WS scale connected');
  });

  ws.on('message', function incoming(data, flags) {
    // console.log(data.match(scaleRe)[0]);
    //Keep scaleData at 1023
    scaleData.shift();
    tareData.shift();
    let currWeight = data.match( /(-)?\d+\.\d+/)[0];

    // Check SM in coffee not present state and that SM not about to transition
    if ( scaleSm.getCurrState() === 'coffee_not_present' && !scaleSm.transitionReady() ) {
      tareValue = calcTare( tareData, tareValue );
    }

    // Directly modifying incoming weight with tareValue -- might cause issues
    scaleData.push(parseInt(currWeight) - parseInt(tareValue));
    tareData.push(parseInt(currWeight));

    //average -- not sure if necessary
    // let average = 0;
    // const AVG_LENGTH = 10;
    // scaleData.slice(scaleData.length - AVG_LENGTH).forEach( (data) => {
    //   average += parseFloat(data);
    // });
    // average = average/AVG_LENGTH;

    const AVG_LENGTH = 5;
    let average = scaleData.slice(scaleData.length - AVG_LENGTH)
      .reduce( (acc,val) => { return acc + val; }) / AVG_LENGTH;

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

function calcTare( tareData, tareValue ) {
  const AVG_LENGTH = 10;
  const MAX_DIFF_LIMIT = 5;

  let lastPoints = tareData.slice(tareData.length-AVG_LENGTH);
  // let lastPoints = tareData;
  let maxDiff = Math.max(...lastPoints) - Math.min(...lastPoints);

  // Only return tareValue if last 50 points is not greater than 5(g?)
  if ( Math.abs(maxDiff) < MAX_DIFF_LIMIT ) {
    return lastPoints.reduce( (acc,val) => {
      return acc + val;
    }) / lastPoints.length;
  } else {
    return tareValue;
  }
}

module.exports = wsClient;
