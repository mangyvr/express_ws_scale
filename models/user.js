'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    uid: DataTypes.STRING,
    provider: DataTypes.STRING,
    oauth_token: DataTypes.STRING,
    oauth_secret: DataTypes.STRING,
    oauth_raw_data: DataTypes.TEXT,
    enable_tweet: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};
