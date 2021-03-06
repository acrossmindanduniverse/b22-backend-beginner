const { db } = require('../helpers/db')
const { promisify } = require('util')

const execPromise = promisify(db.query).bind(db)
module.exports = {
  getAllAndDetails (query) {
    const key = Object.keys(query.sort)[0]
    const sort = query.sort[key]
    console.log(query)
    if (query.search) {
      return execPromise(`SELECT items.id, items.picture, items.name, items.quantity, items.price, items.item_description, items.delivery_on, items.created_at, items.updated_at FROM items WHERE items.name LIKE '%${query.search}%' ORDER BY ${key} ${sort} LIMIT ? OFFSET ?`, [query.limit, query.offset])
    } else {
      return execPromise(`SELECT items.id, items.name, items.picture, items.quantity, items.price, items.item_description, items.delivery_on, items.created_at, items.updated_at FROM items ORDER BY ${key} ${sort} LIMIT ? OFFSET ?`, [query.limit, query.offset])
    }
  },

  getItemsById: function (id) {
    return execPromise('SELECT name, price FROM items WHERE id IN (?)', [id])
  },

  getItemsByIdSync: function (id, cb) {
    db.query('SELECT id, name, price FROM items WHERE id IN (?)', [id], cb)
  },

  getItemsCount: function (query) {
    return execPromise(`SELECT COUNT (items.id) AS count FROM items WHERE items.name LIKE '%${query.search}%'`)
  },

  getItemById: function (id) {
    return execPromise('SELECT items.id, items.name, items.picture, items.quantity, items.price, items.item_description, items.delivery_on, items.created_at, items.updated_at FROM items WHERE id=?', [id])
  },

  getItemForUpdate: function (id) {
    return execPromise('SELECT items.id, items.name, items.picture, items.quantity, items.price, items.item_description, items.delivery_on, items.created_at, items.updated_at FROM items WHERE id=?', [id])
  },

  getPriceDetail: function (query) {
    const key = Object.values(query)
    return new Promise((resolve, reject) => {
      db.query('SELECT items.id, items.name, categories.name AS category_name, items.price, items.created_at, items.updated_at FROM items LEFT JOIN item_categories ON item_categories.item_id = items.id LEFT JOIN categories ON categories.id = item_categories.category_id LEFT JOIN item_variants ON item_variants.item_id = items.id ORDER BY ?', [key.sort[0]], function (err, res) {
        console.log(Object.values(query.sort))
        if (typeof key.sort[0] === 'string') {
          console.log(true)
        } else {
          console.log(false)
        }
        if (!err) {
          resolve(res)
        } else {
          reject(err)
          console.log(err)
        }
      })
    })
  },

  postItems: function (data) {
    return new Promise((resolve, reject) => {
      db.query('INSERT INTO items (picture, name, price, quantity, delivery_on, item_description) VALUES (?, ?, ?, ?, ?, ?)', [data.picture, data.name, data.price, data.quantity, data.delivery_on, data.item_description], function (err, res) {
        if (!err) {
          resolve(res)
        } else {
          reject(err)
        }
      })
    })
  },

  updateItemDatas: function (data, id) {
    return execPromise('UPDATE items SET ? WHERE id=?', [data, id])
  },

  updateItemPartial: function (data) {
    return new Promise((resolve, reject) => {
      const key = Object.keys(data)
      const lastColumn = key[key.length - 1]
      db.query(`UPDATE items SET ${lastColumn}=? WHERE id=?`, [[data[lastColumn]], data.id], function (err, res) {
        if (data > 1) {
          reject(err)
          console.log(err, 'Oops, you have to put only one column')
        } else {
          resolve(res)
          console.log('ok')
        }
      })
    })
  },

  deleteItem: function (id) {
    return execPromise('DELETE FROM items WHERE id=?', [id])
  }

}
