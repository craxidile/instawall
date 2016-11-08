module.exports = {
    schema: true,
    autoPK: true,
    migrate: 'safe',
    connection: 'mysqlServer',
    tableName: 'polling_task',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
        id: {
            type: "integer",
            columnName: "id",
            primaryKey: true
        },
        tag: {
            type: "string"
        },
        min_tag_id: {
            type: "string"
        },
        working: {
            type: "integer"
        },
        starting_at: {
            type: "datetime"
        },
        ending_at: {
            type: "datetime"
        },
        created_at: {
            type: "datetime"
        },
        updated_at: {
            type: "datetime"
        }
    }
};

