import { DataTypes } from 'sequelize';
import sequelize from '../database/connection';

module.exports = sequelize.define('accounts', {
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  accountType: {
    type: DataTypes.ENUM(['basic', 'standard']),
    allowNull: false,
    defaultValue: 'basic',
  },
  accountNumber: {
    type: DataTypes.BIGINT(10),
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING(30),
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
    type: DataTypes.STRING(30),
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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Email is invalid',
      },
    },
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'NGN',
    validate: {
      equals: {
        args: 'NGN',
        msg: 'NGN is the only acceptable currency',
      },
    },
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: Number(0).toFixed(2),
    allowNull: false,
    set(value) {
      if (typeof value === 'number') {
        this.setDataValue('balance', value.toFixed(2));
      } else {
        throw new TypeError('Value passed to balance setter must be a number.');
      }
    },
    validate: {
      is: {
        args: /^[0-9]*\.[0-9]{2}$/i,
        msg: 'Balance should have a scale of 2',
      },
    },
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
