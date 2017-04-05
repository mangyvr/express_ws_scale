'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    const scales = Array.from(
      {length: 1},
      (value, index) => ({
        id: 1,
        name: "Scale_1",
        path: "192.168.10.123:3008"
      })
    )
    return queryInterface.bulkInsert('Scales', scales, {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete('Scales', scales, {});
  }
};
