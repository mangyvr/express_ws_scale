'use strict';
module.exports = function(sequelize, DataTypes) {
  var Scale = sequelize.define('Scale', {
    name: DataTypes.STRING,
    path: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Scale.hasMany(models.Scale_stats);
      }
    }
  });
  return Scale;
};
