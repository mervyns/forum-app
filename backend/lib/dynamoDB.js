// @ts-nocheck
'use strict';

// const AWSXRay = require('aws-xray-sdk');
const OrderBy = require('natural-orderby');
const AWS = require('aws-sdk');

const options = {
	apiVersion: process.env.DYNAMO_API_VERSION,
	region: process.env.DYNAMO_REGION,
	convertEmptyValues: true,
};

console.log(process.env.AWS_SAM_LOCAL, 'env')
// for local development purposes
/* istanbul ignore next */
if (process.env.ENVIRONMENT === 'development') {
	options.endpoint = process.env.DYNAMO_ENDPOINT;
	if (process.env.AWS_SAM_LOCAL) {
		options.endpoint = process.env.DYNAMO_DOCKER_ENDPOINT;
	}
}

const dynamoDBDoc = new AWS.DynamoDB.DocumentClient({
	service: new AWS.DynamoDB(options),
	convertEmptyValues: true,
});

// eslint-disable-next-line no-underscore-dangle
// if (process.env._X_AMZN_TRACE_ID && process.env.ENVIRONMENT !== 'development') {
// 	AWSXRay.captureAWSClient(dynamoDBDoc.service);
// }

class databaseClass {
	constructor() {
		this.dbDoc = dynamoDBDoc;
	}

	/**
	 * Fetch a single row of data from database
	 * eg: getData('table1', {'KeyName': 'KeyValue'})
	 * @param {string} tableName - name of database table to fetch
	 * @param {object} tableKeys - key-value pair of table key {keyName: keyValue}
	 * @param {string} [attributesToGet] - comma seperated value of attributeNames to fetch, if empty, fetches everything
	 */
	async getData(tableName, tableKeys, attributesToGet) {
		const param = {
			TableName: tableName,
			Key: tableKeys,
		};

		if (attributesToGet) {
			param.ProjectionExpression = attributesToGet;
		}

		try {
			// console.log(this.dbDoc);
			const data = await this.dbDoc.get(param).promise();
			return ((data && data.Item) ? data.Item : {});
			/* istanbul ignore next */
		} catch (e) {
			console.log(`failed ${e.message}`);
			return false;
		}
	}

	/**
	 * Return all entries from database
	 * eg: getData('table1', {'KeyName': 'KeyValue'})
	 * @param {string} tableName - name of database table to fetch
	 */
	async scanData(tableName) {
		try {
			const param = {
				TableName: tableName,
			};

			const data = await this.dbDoc.scan(param).promise();
			return data;
		/* istanbul ignore next */
		} catch (e) {
			console.log(`failed ${e.message}`);
			return null;
		}
	}

	/**
	 * Get all the data from ONE table based on hashKey, uses query instead of batchGet
	 *
	 * @typedef {Object} AdditionalParam
	 * @property {Object} [sortKey] -Key-value pair of the table SORT/RANGE keys { KeyName: KeyValue }
	 * @property {string} [indexName] - name of index to use
	 * @property {Array<Object<string, string|Array>>} [filters] : array of key-value pair to fliter the results by {KeyName: KeyValue}
	 * @property {string} [attributesToGet] - comma seperated values of attributesToGet
	 * @property {Array<Object<string, 'asc'|'desc'>>} [sortColumns] - array of objects to sort the data by [ {ColumnName: 'desc'|'asc'} ]
	 *
	 * @param {string} tableName
	 * @param {Object} hashKey - Key-value pair of table HASH/PARTITION keys { KeyName: KeyValue }
	 * @param {AdditionalParam} [additionalParam] - Additional parameters to getData
	 * @returns
	 * @memberof databaseClass
	 */
	async getDataBatch(tableName, hashKey, additionalParam) {
		let expression = '#1 = :1';
		const expressionValue = Object();
		const expressionName = Object();
		const hKey = Object.keys(hashKey)[0];
		expressionName['#1'] = hKey;
		expressionValue[':1'] = hashKey[hKey];

		// sortKey, indexName, sortColumns, attributesToGet
		if (additionalParam && additionalParam.sortKey) {
			expression += ' AND #2 = :2';
			const sKey = Object.keys(additionalParam.sortKey)[0];
			expressionName['#2'] = sKey;
			expressionValue[':2'] = additionalParam.sortKey[sKey];
		}

		const param = {
			TableName: tableName,
			KeyConditionExpression: expression,
			ExpressionAttributeNames: expressionName,
			ExpressionAttributeValues: expressionValue,
			ReturnConsumedCapacity: 'TOTAL',
		};

		if (additionalParam && additionalParam.indexName) {
			param.IndexName = additionalParam.indexName;
		}

		const removeLastComma = -1;

		if (additionalParam && additionalParam.filters) {
			param.FilterExpression = '';
			let startIdx = 1;
			let startValIdx = 1;
			const finalFilters = [];
			additionalParam.filters.forEach((filter) => {
				const key = Object.keys(filter)[0];
				const val = filter[key];
				if (Array.isArray(val)) {
					param.ExpressionAttributeNames[`#F${startIdx}`] = key;
					let expressionString = `#F${startIdx} IN (`;
					val.forEach((subVal) => {
						expressionString += `:F${startValIdx},`;
						param.ExpressionAttributeValues[`:F${startValIdx}`] = subVal;
						startValIdx += 1;
					});
					expressionString = expressionString.slice(0, removeLastComma);
					expressionString += ')';
					finalFilters.push(expressionString);
				} else {
					finalFilters.push(`#F${startIdx}=:F${startValIdx}`);
					param.ExpressionAttributeNames[`#F${startIdx}`] = key;
					param.ExpressionAttributeValues[`:F${startValIdx}`] = val;
					startValIdx += 1;
				}
				startIdx += 1;
			});
			param.FilterExpression = finalFilters.join(' AND ');
		}

		if (additionalParam && additionalParam.attributesToGet) {
			param.ProjectionExpression = '';
			let startIdx = 1;
			additionalParam.attributesToGet.split(',').forEach((attribute) => {
				param.ProjectionExpression += `#A${startIdx},`;
				param.ExpressionAttributeNames[`#A${startIdx}`] = attribute.trim();
				startIdx += 1;
			});
			param.ProjectionExpression = param.ProjectionExpression.slice(0, removeLastComma);
		}

		let output = [];
		let data;
		/* eslint-disable no-await-in-loop */

		do {
			data = await this.dbDoc.query(param).promise();

			output = output.concat(data.Items);
			if (data.LastEvaluatedKey) {
				param.ExclusiveStartKey = data.LastEvaluatedKey;
			}
		} while (data.LastEvaluatedKey);
		/* eslint-enable no-await-in-loop */

		// empty output
		if (!output.length) {
			return [];
		}

		// use tableKey to sort first
		const identifiers = [v => v[hKey]];
		const order = ['asc'];

		if (additionalParam && additionalParam.sortColumns && additionalParam.sortColumns.length) {
			additionalParam.sortColumns.forEach((element) => {
				const key = Object.keys(element)[0];
				const val = element[key];
				identifiers.push(v => v[key]);
				order.push(val);
			});
		}
		// @ts-ignore
		return OrderBy.orderBy(output, identifiers, order);
	}

	/**
	 *
	 * @param {string} tableName - name of database table to insert
	 * @param {object[]} insertValue - array of objects to insert
	 */
	async putData(tableName, insertValue) {
		const param = {
			TableName: tableName,
			Item: insertValue,
			ReturnConsumedCapacity: 'TOTAL',
		};

		try {
			const data = await this.dbDoc.put(param).promise();
			return data;
			/* istanbul ignore next */
		} catch (e) {
			console.log(`failed ${e.message}`);
			return false;
		}
	}

	/**
	 * Function to write batch data into the table
	 * @param {string} tableName - name of table
	 * @param {Array} insertValues - array of values to be inserted into the table
	 * @returns {Promise<Object>} - Object containing consumed capacity
	 * @memberof databaseClass
	 */
	async putDataBatch(tableName, insertValues) {
		const maxRequest = 25;
		const param = {
			RequestItems: {
				[tableName]: [],
			},
			ReturnConsumedCapacity: 'TOTAL',
		};
		/* eslint-disable no-await-in-loop */
		const returnRes = {
			CapacityUnits: 0,
		};
		for (let i = 0; i < insertValues.length;) {
			const element = insertValues[i];
			if (param.RequestItems[tableName].length < maxRequest) {
				param.RequestItems[tableName].push({
					PutRequest: {
						Item: element,
					},
				});
				i += 1;
			}
			if (param.RequestItems[tableName].length === maxRequest) {
				const res = await this._putDataBatchHelper(param);
				if (!res) {
					return false;
				}
				if (res.ConsumedCapacity[0].TableName === tableName) {
					returnRes.CapacityUnits += res.ConsumedCapacity[0].CapacityUnits;
				}
				if (res.UnprocessedItems && res.UnprocessedItems[tableName]) {
					param.RequestItems[tableName] = res.UnprocessedItems[tableName];
				} else {
					param.RequestItems[tableName] = [];
				}
			}
		}
		// Iteratively add the remaining items to database
		while (param.RequestItems[tableName].length) {
			const res = await this._putDataBatchHelper(param);
			if (res.ConsumedCapacity[0].TableName === tableName) {
				returnRes.CapacityUnits += res.ConsumedCapacity[0].CapacityUnits;
			}
			if (res.UnprocessedItems && res.UnprocessedItems[tableName]) {
				param.RequestItems[tableName] = res.UnprocessedItems[tableName];
			} else {
				param.RequestItems[tableName] = [];
			}
		}
		return returnRes;
		/* eslint-enable no-await-in-loop */
	}

	/* istanbul ignore next */
	async putDataBatchTransaction(transactionItems) {
		try {
			const data = await this.dbDoc.transactWrite(transactionItems).promise();
			return data;
		} catch (e) {
			console.log(`failed ${e.message}`);
			return null;
		}
	}

	/**
	 * Helper function to insert batch data into database
	 * @param {object} insertValues - object to insert data, maximum of 25 entries
	 * @returns {Promise.<AWS.DynamoDB.DocumentClient.BatchWriteItemOutput>} - returns false if failed
	 * @memberof databaseClass
	 */
	async _putDataBatchHelper(insertValues) {
		try {
			const data = await this.dbDoc.batchWrite(insertValues).promise();
			return data;
			/* istanbul ignore next */
		} catch (e) {
			console.log(`failed ${e.message}`);
			return null;
		}
	}

	/**
	 *
	 * @param {string} tableName - name of database table to update
	 * @param {object} tableKeys - key-value pair of table key {keyName: keyValue}
	 * @param {object} updateValues - key-value
	 */
	async updateData(tableName, tableKeys, updateValues) {
		let updateExpression = 'set';
		const updateValue = Object();
		const updateName = Object();
		let keyNum = 0;
		Object.keys(updateValues).forEach((key) => {
			updateExpression += (` #${keyNum}=:${keyNum},`);
			updateName[`#${keyNum}`] = key;
			updateValue[`:${keyNum}`] = updateValues[key];
			keyNum += 1;
		});
		const trimLastComma = -1;
		const param = {
			TableName: tableName,
			Key: tableKeys,
			UpdateExpression: updateExpression.slice(0, trimLastComma),
			ExpressionAttributeValues: updateValue,
			ExpressionAttributeNames: updateName,
			ReturnConsumedCapacity: 'TOTAL',
			ReturnItemCollectionMetrics: 'SIZE',
		};

		try {
			const data = await this.dbDoc.update(param).promise();
			return data;
			/* istanbul ignore next */
		} catch (e) {
			console.log(`failed ${e.message}`);
			return false;
		}
	}

	/**
	 *
	 * @param {string} tableName - name of database table to delete
	 * @param {object} tableKeys - key-value pair of table key {keyName: keyValue}
	 */
	async deleteData(tableName, tableKeys) {
		const param = {
			TableName: tableName,
			Key: tableKeys,
		};
		try {
			const data = await this.dbDoc.delete(param).promise();
			return data;
			/* istanbul ignore next */
		} catch (e) {
			console.log(`failed ${e.message}`);
			return false;
		}
	}

	// /**
	//  *
	//  * @param {string} [lastTable] - last table fetch given by the response - LastEvaluatedTableName
	//  * @param {number} [limit=100] - number of tables to fetch, between 1 - 100
	//  *
	//  * @returns {Promise<AWS.DynamoDB.ListTablesOutput>} - fales when error occurs
	//  */
	// async listTables(lastTable, limit) {
	// 	try {
	// 		const params = Object();
	// 		if (lastTable) {
	// 			params.ExclusiveStartTableName = lastTable;
	// 		}
	// 		const maxReturnObject = 100;
	// 		params.Limit = ((limit) || maxReturnObject);

	// 		const data = await this.db.listTables(params).promise();
	// 		return data;
	// 	} catch (e) {
	// 		console.log(`failed ${e.message}`);
	// 		return null;
	// 	}
	// }
}

// const Database = databaseClass;
// const db = new Database();

module.exports = databaseClass;
