// ✅ Get all projects where user is owner or team member
exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    }).populate('createdBy', 'name email');

    res.status(200).json(projects);
  } catch (err) {
    console.error('Failed to fetch user projects:', err);
    res.status(500).json({ message: 'Failed to load projects' });
  }
};
