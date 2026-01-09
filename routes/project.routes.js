const router = require('express').Router();
const Organization = require('../Models/Organization');
const Project = require('../Models/Project');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "MY_SUPER_SECRET_KEY";

// Auth middleware to extract user from token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create project
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const { orgSlug } = req.body;
    const userId = req.user.id;

    if (!orgSlug) {
      return res.status(400).json({ message: 'orgSlug is required' });
    }

    const org = await Organization.findOne({ slug: orgSlug });
    if (!org) return res.status(404).json({ message: 'Org not found' });

    const project = await Project.create({
      name: 'Untitled',
      org: org._id,
      owner: userId
    });

    res.json(project);
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});


// Get projects
router.get('/o/:orgSlug/projects', authMiddleware, async (req, res) => {
  try {
    const org = await Organization.findOne({ slug: req.params.orgSlug });
    if (!org) return res.status(404).json({ message: 'Org not found' });

    const projects = await Project.find({ org: org._id });
    res.json(projects);
  } catch (err) {
    console.error('GET PROJECTS ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get single project by orgSlug and projectId
router.get('/o/:orgSlug/proj_:projectId', authMiddleware, async (req, res) => {
  try {
    const { orgSlug, projectId } = req.params;
    
    const org = await Organization.findOne({ slug: orgSlug });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    
    const project = await Project.findById(projectId).populate('org');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Verify project belongs to the org
    if (project.org._id.toString() !== org._id.toString()) {
      return res.status(403).json({ message: 'Project does not belong to this organization' });
    }
    
    res.json(project);
  } catch (err) {
    console.error('GET PROJECT ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get project files (placeholder - extend as needed)
router.get('/o/:orgSlug/proj_:projectId/files', authMiddleware, async (req, res) => {
  try {
    const { orgSlug, projectId } = req.params;
    
    const org = await Organization.findOne({ slug: orgSlug });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Verify project belongs to the org
    if (project.org.toString() !== org._id.toString()) {
      return res.status(403).json({ message: 'Project does not belong to this organization' });
    }
    
    // Return empty files array for now (add files model later)
    res.json({ files: [] });
  } catch (err) {
    console.error('GET PROJECT FILES ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
