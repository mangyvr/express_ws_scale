const wrapQuery = require('./wrap-query.js');

class Scale_sm {
  constructor(scaleId, scaleModel, scaleStatsModel) {
    // Available states: coffee_not_present, coffee_off, coffee_on, coffee_present
    this.currentState = 'coffee_not_present';  // set as initial state
    this.nextState = 'coffee_not_present';
    this.alreadyLow = false; // set as object prop to prevent multiple writes
    this.wssWs = ''; // Cannot set this in constructor wss is not setup yet

    this.avgWeightObj = {
      maxLength: 20, //take 10 samples
      avgWeight: Infinity,
      avgArr: []
    };

    this.TRANSITION_WEIGHT = {
      ON_OFF: 200,
      LOW: 500 // only checked in coffee_present state
    };

    this.scale = {
      id: scaleId
    };

    this.modelObj = {
      scale: scaleModel,
      scaleStats: scaleStatsModel
    }; // Should have scaleModel: Scale, scaleStatsModel: Scale_stats

    this.modelObj.scale.findById(this.scale.id).then(function(scale) {
      console.log(`Scale initial state: ${scale.dataValues.state}`);
      this.currentState = scale.dataValues.state;
      this.nextState = scale.dataValues.state;
    });
  }

  // get currentState() {
  //   return this.currentState;
  // }
  //
  // set currentState(currState) {
  //   this.currentState = currState;
  // }
  setScaleModel(scaleModel, scaleStatsModel) {
    this.modelObj.scaleModel = scaleModel;
    this.modelObj.scaleStatsModel = scaleStatsModel;
  }

  setScaleId(scaleId) { this.scale.id = scaleId; }

  getScaleId() { return this.scale.id;}

  getCurrState() { return this.currentState; }

  getNextState() { return this.nextState; }

  setWssWs(wssWs) { this.wssWs = wssWs };

  transitionReady() { return this.currentState !== this.nextState; }

  queryAndSend() {
    if ( this.wssWs ) {
      wrapQuery(1, 'day', this.modelObj.scaleStats, this.wssWs, 'lastDay');
    }
  }

  getAvg(weight) {
    // This will push weight to the avg array until max length is achieved
    // then set the avg weight when correct length
    if ( this.avgWeightObj.avgArr.length < this.avgWeightObj.maxLength ) {
      this.avgWeightObj.avgArr.push( parseInt(weight) ) ;
    } else {
      this.avgWeightObj.avgWeight = this.avgWeightObj.avgArr
                                      .reduce( (acc,val) => { return acc+val; } )
                                      / this.avgWeightObj.maxLength;
      // console.log(this.avgWeightObj.avgWeight);
    }
  }

  resetAvgWeightObj() {
      this.avgWeightObj.avgWeight = Infinity;
      this.avgWeightObj.avgArr = [];
  }

  setNextState (weight) {
    // console.log(this.currentState, this.nextState);
    if ( this.currentState === 'coffee_not_present' ) {
      if (weight > this.TRANSITION_WEIGHT.ON_OFF) {
        this.nextState = 'coffee_on';
      }
      // this.modelObj.scaleStatsModel
      //   .all()
      //   .then(console.dir);
    } else if (this.currentState === 'coffee_present' ) {
      if (weight < this.TRANSITION_WEIGHT.ON_OFF ) {
        this.nextState = 'coffee_off';
      }

      if ( this.alreadyLow === false ) {
        this.getAvg(weight);

        if (this.avgWeightObj.avgWeight < this.TRANSITION_WEIGHT.LOW ) {
         console.log('Coffee low!!!!'); // DB write here?
         this.alreadyLow = true;
         this.modelObj.scaleStats
           .create( {low_event: true, ScaleId: this.scale.id} )
           .then( () => { wrapQuery(1, 'day', this.modelObj.scaleStats, this.wssWs, 'lastDay'); } );
          //  .then( () => { } );
          //  .then( () => { this.alreadyLow = true; } );
        }
      }
    } else if (this.currentState === 'coffee_off' ) {
      this.nextState = 'coffee_not_present';
      console.log('Coffee off the scale!!!!'); // DB write here?
      // Insert row with 'off_event' set to true
      this.modelObj.scaleStats
        .create({off_event: true, ScaleId: this.scale.id})
        .then( () => { wrapQuery(1, 'day', this.modelObj.scaleStats, this.wssWs, 'lastDay'); } );
        // .then(console.log);
        this.alreadyLow = false;  // set so coffee_low db write can occur
        this.resetAvgWeightObj();
    } else if (this.currentState === 'coffee_on' ) {
      this.nextState = 'coffee_present';
      console.log('Coffee on the scale!!!!'); // DB write here?
      // console.log(this.wssWs);
      this.modelObj.scaleStats
        .create({on_event: true, ScaleId: this.scale.id})
        .then( () => { wrapQuery(1, 'day', this.modelObj.scaleStats, this.wssWs, 'lastDay'); } );
        // .then(console.log);
    } else { // invalid state
      console.error(this.currentState);
      console.error('SM in invalid state!!!');
      throw new Error('SM in invalid state!!!');
    }
  }

  transition () {
    this.currentState = this.nextState;
    this.nextState = this.currentState;
    this.modelObj.scale
      .findById(this.scale.id)
      .then((scale) => { scale.update({state: this.currentState}) });

    // Set nextState to be the same to prevent accidental transitions
  }
}

module.exports = Scale_sm;
