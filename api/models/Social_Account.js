module.exports = {
  schema: true,
  autoPK: true,
  migrate: 'safe',
  connection: 'mysqlServer',
  tableName: 'social_account',
  autoCreatedAt: false,
  autoUpdatedAt: false,

  attributes: {
    id: {
      type: "integer",
      columnName: "id",
      primaryKey: true
    },
    access_token: {
      type: "string"
    },
    access_token_secret: {
      type: "string"
    },
    social_id: {
      type: "integer"
    },
    working_amount: {
      type: "integer"
    }
  }
};

