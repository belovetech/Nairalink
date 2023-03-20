'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'accounts',
      [
        {
          userId: '6415bc99f4191c051fab7439',
          accountNumber: 8109211864,
          firstName: 'Abeeb',
          lastName: 'Raheem',
          email: 'rahemabeebishola@gmail.com',
        },
        {
          userId: '6415bc99f4191c051fab740',
          accountNumber: 8109211866,
          firstName: 'Abeeb',
          lastName: 'Raheem',
          email: 'raheeabeebishola@gmail.com',
        },
        {
          userId: '6415bc99f4191c051fab74316',
          accountNumber: 8109211868,
          firstName: 'Abeeb',
          lastName: 'Raheem',
          email: 'rahemabeebishola@gmail.com',
        },
        {
          userId: '6415bc99f4191c051fab7435',
          accountNumber: 8109211861,
          firstName: 'Abeeb',
          lastName: 'Raheem',
          email: 'raheemaeebishola@gmail.com',
        },
        {
          userId: '6415bc99f4191c051fab7436',
          accountNumber: 8109211862,
          firstName: 'Abeeb',
          lastName: 'Raheem',
          email: 'raheemabeebshola@gmail.com',
        },
        {
          userId: '6415bc99f4191c051fab7437',
          accountNumber: 8109214864,
          firstName: 'Abeeb',
          lastName: 'Raheem',
          email: 'raheemabeebishoa@gmail.com',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('accounts', null, {});
  },
};
