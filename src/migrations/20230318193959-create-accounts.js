'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      accountType: {
        type: Sequelize.ENUM(['basic', 'standard']),
        allowNull: false,
        defaultValue: 'basic',
      },
      accountNumber: {
        type: Sequelize.BIGINT(10),
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          len: {
            args: [3, 30],
            msg: 'First name should be between 3 and 30 characters',
          },
        },
        set(value) {
          let newValue = value.trim();
          newValue = newValue[0].toUpperCase() + newValue.substring(1);
          this.setDataValue('firstName', newValue);
        },
      },
      lastName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          len: {
            args: [3, 30],
            msg: 'Last name should be between 3 and 30 characters',
          },
        },
        set(value) {
          let newValue = value.trim();
          newValue = newValue[0].toUpperCase() + newValue.substring(1);
          this.setDataValue('lastName', newValue);
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Email is invalid',
          },
        },
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'NGN',
        validate: {
          equals: {
            args: 'NGN',
            msg: 'NGN is the only acceptable currency',
          },
        },
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: Number(0).toFixed(2),
        allowNull: false,
        set(value) {
          this.setDataValue('balance', value.toFixed(2));
        },
        validate: {
          is: {
            args: /^[0-9]*\.[0-9]{2}$/i,
            msg: 'Balance should have a scale of 2',
          },
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('accounts');
  },
};
