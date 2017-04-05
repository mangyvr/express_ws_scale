'use strict';

const faker = require('faker');

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
    let scale_stats = Array.from(
      {length: 1000},
      (value, index) => ({
        on_event: "true",
        ScaleId: 1,
        createdAt: faker.date.past(1)
      })
    );

    scale_stats = scale_stats.concat( Array.from(
      {length: 1000},
      (value, index) => ({
        off_event: "true",
        ScaleId: 1,
        createdAt: faker.date.past(1)
      })
    ) );

    scale_stats = scale_stats.concat( Array.from(
      {length: 400},
      (value, index) => ({
        low_event: "true",
        ScaleId: 1,
        createdAt: faker.date.past(1)
      })
    ) );

    return queryInterface.bulkInsert('Scale_stats', scale_stats, {});
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};
