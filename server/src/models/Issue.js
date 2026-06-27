const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  category:    {
    type: String,
    enum: ['Pothole', 'Water Leakage', 'Streetlight', 'Garbage', 'Encroachment', 'Other'],
    default: 'Other'
  },
  severity:    { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  department:  { type: String, default: '' },
  aiSummary:   { type: String, default: '' },
  location: {
    address: { type: String, required: true },
    city:    { type: String, default: 'Hazaribagh' },
    lat:     { type: Number },
    lng:     { type: Number },
  },
  images:     [{ type: String }],
  status: {
    type: String,
    enum: ['Reported', 'Verified', 'In Progress', 'Resolved', 'Closed'],
    default: 'Reported'
  },
  upvotes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verifiedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reporter:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);