class Order {
    constructor(id, customer, product, status) {
      this.id = id;
      this.customer = customer;
      this.product = product;
      this.status = status;
    }
  
    // Méthode pour récupérer toutes les commandes
    static getAll() {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour récupérer toutes les commandes dans la base de données
        const query = "SELECT * FROM orders";
        db.query(query, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results.map(result => new Order(result.id, result.customer, result.product, result.status)));
          }
        });
      });
    }
  
    // Méthode pour récupérer une commande par son identifiant
    static getById(id) {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour récupérer la commande avec l'identifiant spécifié dans la base de données
        const query = "SELECT * FROM orders WHERE id = ?";
        db.query(query, [id], (error, results) => {
          if (error) {
            reject(error);
          } else if (results.length === 0) {
            reject(new Error("Order not found"));
          } else {
            const result = results[0];
            resolve(new Order(result.id, result.customer, result.product, result.status));
          }
        });
      });
    }
  
    // Méthode pour ajouter une commande à la base de données
    static create(customer, product) {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour ajouter une commande à la base de données
        const query = "INSERT INTO orders (customer, product, status) VALUES (?, ?, 'En attente')";
        db.query(query, [customer, product], (error, result) => {
          if (error) {
            reject(error);
          } else {
            const id = result.insertId;
            resolve(new Order(id, customer, product, "En attente"));
          }
        });
      });
    }
  
    // Méthode pour mettre à jour l'état d'une commande dans la base de données
    updateStatus(status) {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour mettre à jour l'état de la commande dans la base de données
        const query = "UPDATE orders SET status = ? WHERE id = ?";
        db.query(query, [status, this.id], error => {
          if (error) {
            reject(error);
          } else {
            this.status = status;
            resolve(this);
          }
        });
      });
    }
  }
  
  module.exports = Order;