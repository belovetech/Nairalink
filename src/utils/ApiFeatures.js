class ApiFeatures {
  constructor(queryString) {
    this.query = null;
    this.queryString = queryString;
  }

  filter() {
    this.query = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete this.query[el]);
    return this.query;
  }

  fields() {
    if (this.queryString.fields) {
      this.query = this.queryString.fields.split(',');
    } else {
      this.query = { exclude: ['updatedAt'] };
    }
    return this.query;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.queryString.sort;
    } else {
      this.query = 'createdAt';
    }
    return this.query;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const skip = (page - 1) * limit;
    this.query = [skip, limit];
    return this.query;
  }
}

module.exports = ApiFeatures;
