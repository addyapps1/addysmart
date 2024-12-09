class AggApiFeatures {
  constructor(pipeline, queryStr) {
      this.pipeline = pipeline;
      this.queryStr = queryStr;
  }

  aggfilter() {
      // Implement your filter logic for aggregation pipelines
      // Add $match stage for filtering in the aggregation pipeline
      const excludeFields = ['sort', 'page', 'limit', 'fields'];
      const newPipeline = [...this.pipeline];

      excludeFields.forEach((el) => {
          delete this.queryStr[el];
      });

      newPipeline.push({ $match: { ...this.queryStr } });

      return new AggApiFeatures(newPipeline, this.queryStr);
  }

  aggsort() {
      if (this.queryStr.sort) {
          const sortFields = this.queryStr.sort.split(',').map((field) => {
              if (field.startsWith('-')) {
                  // Handle descending order
                  return { [field.slice(1)]: -1 };
              }
              // Handle ascending order
              return { [field]: 1 };
          });

          const newPipeline = [...this.pipeline, { $sort: sortFields }];
          return new AggApiFeatures(newPipeline, this.queryStr);
      } else {
          // Default sorting by the "created" field in ascending order
          return new AggApiFeatures(this.pipeline, this.queryStr);
      }
  }

  agglimitfields() {
      if (this.queryStr.fields) {
          const fieldsToSelect = this.queryStr.fields.split(',').join(' ');
          const projectStage = { $project: {} };
          fieldsToSelect.split(' ').forEach((field) => {
              projectStage.$project[field] = 1;
          });

          const newPipeline = [...this.pipeline, projectStage];
          return new AggApiFeatures(newPipeline, this.queryStr);
      } else {
          // Default selection if no specific fields are requested
          const projectStage = { $project: {} };
          [
              '__v',
              'passwordResetToken',
              'passwordResetTokenExp',
              'emailVerificationToken',
              'emailVerificationTokenExp',
              'failedLogginAttempts',
              'lastAttemptTime',
              'loggedOutAllAt',
          ].forEach((field) => {
              projectStage.$project[field] = 0;
          });

          const newPipeline = [...this.pipeline, projectStage];
          return new AggApiFeatures(newPipeline, this.queryStr);
      }
  }

  agglimitfields2() {
      const fieldsToExclude = this.queryStr.fields ? this.queryStr.fields.split(',').join(' ') : '';

      if (fieldsToExclude) {
          const projectStage = { $project: {} };
          fieldsToExclude.split(' ').forEach((field) => {
              projectStage.$project[field] = 0;
          });

          const newPipeline = [...this.pipeline, projectStage];
          return new AggApiFeatures(newPipeline, this.queryStr);
      } else {
          // No fields to exclude
          return new AggApiFeatures(this.pipeline, this.queryStr);
      }
  }

  aggpaginate() {
      const page = (this.queryStr.page) * 1 || 1;
      const limit = (this.queryStr.limit) * 1 || 20; // setting the default limit to 20
      const skips = (page - 1) * limit;

      const newPipeline = [...this.pipeline, { $skip: skips }, { $limit: limit }];
      return new AggApiFeatures(newPipeline, this.queryStr);
  }
}

export default AggApiFeatures;



// class AggApiFeatures {
//     constructor(pipeline, queryStr) {
//       this.pipeline = pipeline;
//       this.queryStr = queryStr;
//     }
  
//     aggfilter() {
//       // Implement your filter logic for aggregation pipelines
//       // Add $match stage for filtering in the aggregation pipeline
//       const excludeFields = ['sort', 'page', 'limit', 'fields'];
//       const newPipeline = [...this.pipeline];
  
//       excludeFields.forEach((el) => {
//         delete this.queryStr[el];
//       });
  
//       newPipeline.push({ $match: { ...this.queryStr } });
  
//       return new AggApiFeatures(newPipeline, this.queryStr);
//     }
  
//     aggsort() {
//       if (this.queryStr.sort) {
//         const sortFields = this.queryStr.sort.split(',').map((field) => {
//           if (field.startsWith('-')) {
//             // Handle descending order
//             return { [field.slice(1)]: -1 };
//           }
//           // Handle ascending order
//           return { [field]: 1 };
//         });
  
//         const newPipeline = [...this.pipeline, { $sort: sortFields }];
//         return new AggApiFeatures(newPipeline, this.queryStr);
//       } else {
//         // Default sorting by the "created" field in ascending order
//         return new AggApiFeatures(this.pipeline, this.queryStr);
//       }
//     }
  
//     agglimitfields() {
//       if (this.queryStr.fields) {
//         const fieldsToSelect = this.queryStr.fields.split(',').join(' ');
//         const projectStage = { $project: {} };
//         fieldsToSelect.split(' ').forEach((field) => {
//           projectStage.$project[field] = 1;
//         });
  
//         const newPipeline = [...this.pipeline, projectStage];
//         return new AggApiFeatures(newPipeline, this.queryStr);
//       } else {
//         // Default selection if no specific fields are requested
//         const projectStage = { $project: {} };
//         [
//           '__v',
//           'passwordResetToken',
//           'passwordResetTokenExp',
//           'emailVerificationToken',
//           'emailVerificationTokenExp',
//           'failedLogginAttempts',
//           'lastAttemptTime',
//           'loggedOutAllAt',
//         ].forEach((field) => {
//           projectStage.$project[field] = 0;
//         });
  
//         const newPipeline = [...this.pipeline, projectStage];
//         return new AggApiFeatures(newPipeline, this.queryStr);
//       }
//     }
  
//     agglimitfields2() {
//       const fieldsToExclude = this.queryStr.fields ? this.queryStr.fields.split(',').join(' ') : '';
  
//       if (fieldsToExclude) {
//         const projectStage = { $project: {} };
//         fieldsToExclude.split(' ').forEach((field) => {
//           projectStage.$project[field] = 0;
//         });
  
//         const newPipeline = [...this.pipeline, projectStage];
//         return new AggApiFeatures(newPipeline, this.queryStr);
//       } else {
//         // No fields to exclude
//         return new AggApiFeatures(this.pipeline, this.queryStr);
//       }
//     }
  
//     aggpaginate() {
//       const page = (this.queryStr.page) * 1 || 1;
//       const limit = (this.queryStr.limit) * 1 || 20; // setting the default limit to 20
//       const skips = (page - 1) * limit;
  
//       const newPipeline = [...this.pipeline, { $skip: skips }, { $limit: limit }];
//       return new AggApiFeatures(newPipeline, this.queryStr);
//     }
//   }
  
//   module.exports = AggApiFeatures;
  