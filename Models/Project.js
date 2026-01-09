const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
{
    name: { type: String, default: 'Untitled' },
    org: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
