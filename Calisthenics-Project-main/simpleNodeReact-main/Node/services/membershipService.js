const VAT_PERCENT = 18;

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class MembershipService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAll() {
    return this.repository.getAll();
  }

  async create({ name, price, duration_days, entry_count = 0 }) {
    const priceWithVat = parseFloat((price * (1 + VAT_PERCENT / 100)).toFixed(2));

    const result = await this.repository.create({
      name,
      price,
      priceWithVat,
      duration_days,
      entry_count,
    });

    return {
      message: "מנוי נוסף בהצלחה",
      membership_id: result.insertId,
      name,
      price,
      price_with_vat: priceWithVat,
      duration_days,
      entry_count,
    };
  }

  async update(id, { name, price, duration_days, entry_count = 0 }) {
    const priceWithVat = parseFloat((price * (1 + VAT_PERCENT / 100)).toFixed(2));

    const result = await this.repository.update(id, {
      name,
      price,
      priceWithVat,
      duration_days,
      entry_count,
    });

    if (result.affectedRows === 0) {
      throw new AppError("המנוי לא נמצא", 404);
    }

    return {
      message: "מנוי עודכן בהצלחה",
      membership_id: id,
      name,
      price,
      price_with_vat: priceWithVat,
      duration_days,
      entry_count,
    };
  }

  async deleteById(id) {
    const result = await this.repository.deleteById(id);
    if (result.affectedRows === 0) {
      throw new AppError("המנוי לא נמצא", 404);
    }
    return { message: "מנוי נמחק בהצלחה" };
  }
}

module.exports = { MembershipService, AppError };
