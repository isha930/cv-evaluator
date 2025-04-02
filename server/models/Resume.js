
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  skillScore: {
    type: Number,
    default: 0,
  },
  skillDescription: {
    type: String,
    default: '',
  },
  experienceScore: {
    type: Number,
    default: 0,
  },
  experienceDescription: {
    type: String,
    default: '',
  },
  overallScore: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    default: '',
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  rank: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
