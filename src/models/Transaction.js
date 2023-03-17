import { DataTypes } from 'sequelize';
import sequelize from '../database/connection';

export default sequelize.define('transaction', {
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
      model: 'Account',
      key: 'accountNumber'
    },
    set(value) {
      if (this.transactionType === 'fund') {
        this.setDataValue('fromAccount', 1111111111);
      } else {
        this.setDataValue('fromAccount', value);
      }
    }
  },
  toAccount: {
    type: DataTypes.BIGINT(10),
    allowNull: false,
    references: {
      model: 'Account',
      key: 'accountNumber'
    },
    set(value) {
      if (this.transactionType === 'withdraw') {
        this.setDataValue('fromAccount', 0000000000);
      } else {
        this.setDataValue('fromAccount', value);
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2).UNSIGNED,
    allowNull: false,
    validate: (value) => {
      if (parseInt(value) <= 0) {
        throw('Amount should be more than 0.00');
      }
    }
  },
  transactionDescription: {
    type: DataTypes.STRING(100),
  },
  transactionStatus: {
    type: DataTypes.ENUM(['successful', 'pending', 'failed']),
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: true
});
