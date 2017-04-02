'use strict';
module.exports = function(sequelize, DataTypes) {
  var Scale_stats = sequelize.define('Scale_stats', {
    on_event: DataTypes.BOOLEAN,
    off_event: DataTypes.BOOLEAN,
    low_event: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Scale_stats.belongsTo(models.Scale);
      }
    }
  });
  return Scale_stats;
};
