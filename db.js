const { Database } = require('fakebase');

const db = new Database('./data');

const Url = db.table('urls')

module.exports = Url;