class Claim {
    constructor(id, customer, description, status) {
      this.id = id;
      this.customer = customer;
      this.description = description;
      this.status = status;
    }
  
    // Méthode pour récupérer toutes les réclamations
    static getAll() {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour récupérer toutes les réclamations dans la base de données
        const query = "SELECT * FROM claims";
        db.query(query, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results.map(result => new Claim(result.id, result.customer, result.description, result.status)));
          }
        });
      });
    }
  
    // Méthode pour récupérer une réclamation par son identifiant
    static getById(id) {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour récupérer la réclamation avec l'identifiant spécifié dans la base de données
        const query = "SELECT * FROM claims WHERE id = ?";
        db.query(query, [id], (error, results) => {
          if (error) {
            reject(error);
          } else if (results.length === 0) {
            reject(new Error("Claim not found"));
          } else {
            const result = results[0];
            resolve(new Claim(result.id, result.customer, result.description, result.status));
          }
        });
      });
    }
  
    // Méthode pour ajouter une réclamation à la base de données
    static create(customer, description) {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour ajouter une réclamation à la base de données
        const query = "INSERT INTO claims (customer, description, status) VALUES (?, ?, 'En attente')";
        db.query(query, [customer, description], (error, result) => {
          if (error) {
            reject(error);
          } else {
            const id = result.insertId;
            resolve(new Claim(id, customer, description, "En attente"));
          }
        });
      });
    }
  
    // Méthode pour mettre à jour l'état d'une réclamation dans la base de données
    updateStatus(status) {
      return new Promise((resolve, reject) => {
        // Effectuer une requête SQL pour mettre à jour l'état de la réclamation dans la base de données
        const query = "UPDATE claims SET status = ? WHERE id = ?";
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
  
  module.exports = Claim;