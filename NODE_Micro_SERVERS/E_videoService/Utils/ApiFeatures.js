class Apifeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filterViewedContent(viewedContentIds) {
    if (viewedContentIds && viewedContentIds.length > 0) {
      this.query = this.query.find({
        _id: { $nin: viewedContentIds }, // Exclude viewed content by IDs
      });
    }
    return this;
  }

  getRandom = async (numValues) => {
    // Use MongoDB's $sample to get random documents
    this.query = this.query.aggregate([
      { $sample: { size: numValues } }, // Randomly select numValues documents
    ]);

    return this;
  }

  ////

  filter() {
    const excludeFilds = ["sort", "page", "limit", "fields"];
    const queryObj = { ...this.queryStr };
    excludeFilds.forEach((el) => {
      delete queryObj[el];
    });

    let querystr = JSON.stringify(queryObj);
    querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const queryObjnew = JSON.parse(querystr);
    this.query = this.query.find(queryObjnew);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-created");
    }
    return this;
  }

  limitfields() {
    if (this.queryStr.fields) {
      const filedsBy = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.sort(filedsBy);
      this.query = this.query.select(filedsBy);
    } else {
      this.query = this.query.select("-__v");
      this.query = this.query.select("-passwordResetToken");
      this.query = this.query.select("-passwordResetTokenExp");
      this.query = this.query.select("-emailVerificationToken");
      this.query = this.query.select("-emailVerificationTokenExp");
      this.query = this.query.select("-failedLogginAttempts");
      this.query = this.query.select("-lastAttemptTime");
      this.query = this.query.select("-loggedOutAllAt");
      this.query = this.query.select("-role");
      this.query = this.query.select("-roleChangedAt");
    }
    return this;
  }

  limitfields2() {
    this.query = this.query.select("-__v");
    this.query = this.query.select("-passwordResetToken");
    this.query = this.query.select("-passwordResetTokenExp");
    this.query = this.query.select("-emailVerificationToken");
    this.query = this.query.select("-emailVerificationTokenExp");
    this.query = this.query.select("-failedLogginAttempts");
    this.query = this.query.select("-lastAttemptTime");
    this.query = this.query.select("-loggedOutAllAt");
    this.query = this.query.select("-role");
    this.query = this.query.select("-roleChangedAt");
    return this;
  }

  countDocuments() {
    this.totalCountPromise = this.query.model.countDocuments(
      this.query.getFilter()
    );
    return this;
  }

  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 20; // setting the default limit to 20
    const skips = (page - 1) * limit;
    this.query = this.query.skip(skips).limit(limit);
    return this;
  }
}

export default Apifeatures;
