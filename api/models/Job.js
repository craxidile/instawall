/**
* Job.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,
  autoPK: false,
  migrate: 'safe',
  connection: 'mysqlServer',
  tableName: 'job',
  autoCreatedAt: false,
  autoUpdatedAt: false,

  attributes: {
        id: {
            type: "integer",
            columnName: "id",
            primaryKey: true
        },
		port_photo_x: {
			type: "integer"
		},
		port_photo_y: {
			type: "integer"
		},
		port_photo_width: {
			type: "integer"
		},
		port_photo_height: {
			type: "integer"
		},
		port_width: {
			type: "integer"
		},
		port_height: {
			type: "integer"
		},
		land_photo_x: {
			type: "integer"
		},
		land_photo_y: {
			type: "integer"
		},
		land_photo_width: {
			type: "integer"
		},
		land_photo_height: {
			type: "integer"
		},
		land_width: {
			type: "integer"
		},
		land_height: {
			type: "integer"
		},
		number_size: {
			type: "integer"
		},
		printer_prefix: {
			type: "string"
		},
		fixed_orientation: {
			type: "string"
		},
        tag: {
            type: "string",
        },
        background_image_port: {
            type: "string"
        },
		background_image_land: {
		  type: "string"
		},
        overlay_image_port: {
            type: "string"
        },
		overlay_image_land: {
		  type: "string"
		},
        logo_image: {
            type: "string"
        },
        fgcolor: {
            type: "string"
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

