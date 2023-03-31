/* eslint-disable comma-dangle */
import { DataTypes } from 'sequelize';
import sequelize from '../database/connection';

module.exports = sequelize.define('transactions', {
  transactionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  transactionType: {
    type: DataTypes.ENUM(['fund', 'transfer', 'withdraw']),
    allowNull: false,
  },
  fromAccount: {
    type: DataTypes.BIGINT(10),
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
    type: DataTypes.BIGINT(10),
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'accountNumber',
    },
    set(value) {
      if (this.transactionType === 'withdraw') {
        this.setDataValue('toAccount', this.fromAccount);
      } else {
        this.setDataValue('toAccount', value);
      }
    },
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2).UNSIGNED,
    allowNull: false,
    validate: (value) => {
      if (parseInt(value, 10) <= 0) {
        throw new Error('Amount should be more than 0.00');
      }
    },
  },
  transactionDescription: {
    type: DataTypes.STRING(100),
  },
  transactionStatus: {
    type: DataTypes.ENUM(['successful', 'pending', 'failed']),
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
});
