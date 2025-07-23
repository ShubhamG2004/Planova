// backend/controllers/projectController.js
const { db } = require('../config/firebase');

exports.createProject = async (req, res) => {
  const { title, description, tags } = req.body;
  const { uid, email, name } = req.user;

  if (!title) {
    return res.status(400).json({ message: 'Project title is required' });
  }

  try {
    const projectData = {
      title,
      description: description || '',
      tags: (tags || []).map((tag) => tag.trim()).filter(Boolean),
      createdBy: uid,
      createdByName: name || email,
      members: [uid],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('projects').add(projectData);

    return res.status(201).json({ message: 'Project created successfully' });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};
