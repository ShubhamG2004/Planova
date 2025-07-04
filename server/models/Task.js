const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  startDate: { type: Date },
  dueDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  comments: [
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }
]

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
