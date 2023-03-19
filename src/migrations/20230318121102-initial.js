'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable('accounts', {
          userId: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            allowNull: false,
            unique: true
          },
          accountType: {
            type: Sequelize.DataTypes.ENUM(['basic', 'standard']),
            allowNull: false,
            defaultValue: 'basic'
          },
          accountNumber: {
            type: Sequelize.DataTypes.BIGINT(10),
            allowNull: false,
            primaryKey: true,
            unique: true
          },
          firstName: {
            type: Sequelize.DataTypes.STRING(30),
            allowNull: false,
            validate: {
              len: {
                args: [3, 30],
                msg: "First name should be between 3 and 30 characters"
              }
            },
            set(value) {
              let newValue = value.trim();
              newValue = newValue[0].toUpperCase() + newValue.substring(1);
              this.setDataValue('firstName', newValue);
            }
          },
          lastName: {
            type: Sequelize.DataTypes.STRING(30),
            allowNull: false,
            validate: {
              len: {
                args: [3, 30],
                msg: "Last name should be between 3 and 30 characters"
              }
            },
            set(value) {
              let newValue = value.trim();
              newValue = newValue[0].toUpperCase() + newValue.substring(1);
              this.setDataValue('lastName', newValue);
            }
          },
          email: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            validate: {
              isEmail: {
                msg: 'Email is invalid'
              }
            }
          },
          currency: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: 'NGN',
            validate: {
              equals: {
                args: 'NGN',
                msg: "NGN is the only acceptable currency"
              }
            }
          },
          balance: {
            type: Sequelize.DataTypes.DECIMAL(12, 2),
            defaultValue: 0.00,
            allowNull: false,
            validate: {
              is: {
                args: /^[0-9]*\.[0-9]{2}$/i,
                msg: 'Balance should have a scale of 2'
              }
            }
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            defaultValue: new Date()
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            defaultValue: new Date()
          }
        }, { transaction: t }),
        queryInterface.createTable('transactions', {
          transactionId: {
            type: Sequelize.DataTypes.UUID,
            defaultValue: Sequelize.DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
          },
          transactionType: {
            type: Sequelize.DataTypes.ENUM(['fund', 'transfer', 'withdraw']),
            allowNull: false,
          },
          fromAccount: {
            type: Sequelize.DataTypes.BIGINT(10),
            allowNull: false,
            references: {
              model: 'accounts',
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
            type: Sequelize.DataTypes.BIGINT(10),
            allowNull: false,
            references: {
              model: 'accounts',
              key: 'accountNumber'
            },
            set(value) {
              if (this.transactionType === 'withdraw') {
                this.setDataValue('toAccount', 7777777777);
              } else {
                this.setDataValue('toAccount', value);
              }
            }
          },
          amount: {
            type: Sequelize.DataTypes.DECIMAL(12, 2).UNSIGNED,
            allowNull: false,
            validate: (value) => {
              if (parseInt(value) <= 0) {
                throw('Amount should be more than 0.00');
              }
            }
          },
          transactionDescription: {
            type: Sequelize.DataTypes.STRING(100),
          },
          transactionStatus: {
            type: Sequelize.DataTypes.ENUM(['successful', 'pending', 'failed']),
            allowNull: false
          },
          createdAt: {
            type: Sequelize.DataTypes.DATE,
            defaultValue: new Date()
          },
          updatedAt: {
            type: Sequelize.DataTypes.DATE,
            defaultValue: new Date()
          }
        }, { transaction: t })
      ]);
    });
  },

  down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('transactions', { transaction: t }),
        queryInterface.dropTable('accounts', { transaction: t })
      ]);
    });
  }
};
