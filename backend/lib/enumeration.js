'use strict';

const STATUS = {
	OK: 'ok',
	FAIL: 'fail',
};
Object.freeze(STATUS);

const STATUS_CODE = {
	OK: 200,
	FAIL: 400,
	FORBIDDEN: 403,
	ERROR: 404,
	MTA: 405,
};
Object.freeze(STATUS_CODE);

module.exports = {
	STATUS,
	STATUS_CODE,
};
