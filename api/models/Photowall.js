/**
* Photowall.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    schema: true,
    autoPK: false,
    migrate: 'safe',
    connection: 'mysqlServer',
    tableName: 'photowall',
    autoCreatedAt: false,
    autoUpdatedAt: false,

    attributes: {
        photowall_id: {
            type: "integer",
            columnName: "photowall_id",
            primaryKey: true
        },
        image_id: {
            type: "string"
        },
        user_id: {
            type: "integer"
        },
        username: {
            type: "string"
        },
        img_username: {
            type: "text"
        },
        img_thumbnail: {
            type: "text"
        },
        img_low: {
            type: "text"
        },
        img_standard: {
            type: "text"
        },
        path_small: {
            type: "text"
        },
        path_medium: {
            type: "text"
        },
        path_large: {
            type: "text"
        },
        path_original: {
            type: "text"
        },
        path_profile: {
            type: "text"
        },
        caption: {
            type: "text"
        },
        created_time: {
            type: "integer"
        },
        type: {
            type: "string"
        },
        filter: {
            type: "string"
        },
        likes: {
            type: "integer"
        },
        tag: {
            type: "string"
        },
        following: {
            type: "integer"
        },
        followers: {
            type: "integer"
        },
        count: {
            type: "integer"
        },
        is_activate: {
            type: "integer"
        }
    }
};

