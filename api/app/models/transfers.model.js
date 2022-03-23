const sql = require("./db.js");
const { v4: uuidv4 } = require('uuid');

// constructor
const Transfers = function(transfer) {
  this.account_holder = transfer.account_holder;
  this.iban = transfer.iban;
  this.amount = transfer.amount;
  this.date = new Date(transfer.date);
  this.note = transfer.note;
};

Transfers.create = (newTransfer, result) => {
  newTransfer['uuid'] = uuidv4();
  sql.query("INSERT INTO transfer SET ?", newTransfer, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    result(null, { id: res.insertId, ...newTransfer });
  });
};

Transfers.findById = (uuid, result) => {
  sql.query(`SELECT * FROM transfer WHERE uuid = '${uuid}'`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res[0]);
      return;
    }

    // not found Transfer with the id
    result({ kind: "not_found" }, null);
  });
};

Transfers.getAll = (searchQuery, result) => {
  let query = "SELECT * FROM transfer";

  if (searchQuery) {
    query += ` WHERE account_holder LIKE '%${searchQuery}%' or note LIKE '%${searchQuery}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Transfers.updateById = (uuid, transfer, result) => {
  sql.query(
    "UPDATE transfer SET account_holder = ?, iban = ?, amount = ?, date = ?, note = ? WHERE uuid = ?",
    [transfer.account_holder, transfer.iban, transfer.amount, transfer.date, transfer.note, uuid],
    (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Transfer with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { uuid, ...transfer });
    }
  );
};

Transfers.remove = (id, result) => {
  sql.query("DELETE FROM transfer WHERE uuid = ?", id, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found Transfer with the id
      result({ kind: "not_found" }, null);
      return;
    }
    result(null, res);
  });
};

module.exports = Transfers;
