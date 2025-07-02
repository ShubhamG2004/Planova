const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'project_manager', 'developer', 'viewer'],
      default: 'developer'
    }
  }],
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  sprints: [{
    type: Schema.Types.ObjectId,
    ref: 'Sprint'
  }],
  roadmap: [{
    milestone: String,
    date: Date,
    completed: Boolean
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cascade delete tasks when project is removed
ProjectSchema.pre('remove', async function(next) {
  await this.model('Task').deleteMany({ projectId: this._id });
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);