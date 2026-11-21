
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        "Orders",
        "userId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        { transaction }
      );

      await queryInterface.addIndex("Orders", ["userId"], {
        name: "orders_user_id_idx",
        transaction,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(
        "Orders",
        "orders_user_id_idx",
        { transaction }
      );

      await queryInterface.removeColumn(
        "Orders",
        "userId",
        { transaction }
      );
    });
  },
};
