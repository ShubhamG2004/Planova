const mongoose = require('mongoose');
const { Schema } = mongoose;

const roadmapSchema = new Schema({
  milestone: {
    type: String,
    trim: true,
    maxlength: [200, 'Milestone cannot exceed 200 characters']
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  }
}, { _id: false });

const projectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Project title cannot exceed 100 characters'],
    minlength: [3, 'Project title must be at least 3 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  sprints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  }],
  roadmap: [roadmapSchema],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed', 'pending'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tags cannot exceed 20 characters each']
  }],
  startDate: {
    type: Date
  },
  targetDate: {
    type: Date
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual member count (including creator)
projectSchema.virtual('memberCount').get(function () {
  return (this.members?.length || 0) + 1;
});

// Indexes
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);
