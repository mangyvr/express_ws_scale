const wrapQuery = function(num, unit, model, ws, queryType) {
  const WebSocket = require('ws');

  Promise.all([
    queryForLast(num, unit, 'on_event', model),
    queryForLast(num, unit, 'off_event', model),
    queryForLast(num, unit, 'low_event', model)
  ])
  .then( (result_arr) => {
    let eventData = {
      onEvent: result_arr[0],
      offEvent: result_arr[1],
      lowEvent: result_arr[2]
    }
    console.log(eventData);
    if ( ws.readyState === WebSocket.OPEN ) {
      ws.send(JSON.stringify( { queryType: queryType, eventData: eventData } ));
    } else {
      console.error('Websocket not open in wrap-query.  Check client is connected.');
    }
  });
}

const queryForLast = function(num, unit, event, model) {
  const Sequelize = require('sequelize');
  // Need this to make raw SQL queries
  const sequelize = new Sequelize('scale_dev', 'tyt', null ,{
    dialect: 'postgres'
  });

  return new Promise((resolve, reject) => {
    sequelize.query(`SELECT COUNT(*) FROM "Scale_stats" WHERE "createdAt" > current_date - interval '${num}' ${unit} AND ${event}=true`,
      { model: model })
      .then((data) => {
        // console.log(data[0].dataValues.count);
        resolve(data[0].dataValues.count);
      })
      .catch((reason) => { reject(reason) });
  });

}

module.exports = wrapQuery;
