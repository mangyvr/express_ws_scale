'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Scale_stats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      on_event: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      off_event: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      low_event: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      ScaleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Scales',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Scale_stats');
  }
};
