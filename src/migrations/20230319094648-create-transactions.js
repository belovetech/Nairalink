/* eslint-disable no-unused-vars */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      transactionId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      transactionType: {
        type: Sequelize.ENUM(['fund', 'transfer', 'withdraw']),
        allowNull: false,
      },
      fromAccount: {
        type: Sequelize.BIGINT(10),
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'accountNumber',
        },
        set(value) {
          if (this.transactionType === 'fund') {
            this.setDataValue('fromAccount', 1111111111);
          } else {
            this.setDataValue('fromAccount', value);
          }
        },
      },
      toAccount: {
        type: Sequelize.BIGINT(10),
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'accountNumber',
        },
        set(value) {
          if (this.transactionType === 'withdraw') {
            this.setDataValue('toAccount', 7777777777);
          } else {
            this.setDataValue('toAccount', value);
          }
        },
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2).UNSIGNED,
        allowNull: false,
        validate: (value) => {
          if (parseInt(value, 10) <= 0) {
            throw new Error('Amount should be more than 0.00');
          }
        },
      },
      transactionDescription: {
        type: Sequelize.STRING(100),
      },
      transactionStatus: {
        type: Sequelize.ENUM(['successful', 'pending', 'failed']),
        allowNull: false,
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
    await queryInterface.dropTable('transactions');
  },
};
