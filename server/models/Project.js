// server/models/Project.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  sprints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' }],
  roadmap: [{
    milestone: String,
    dueDate: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
