const router = require('express').Router();
const Organization = require('../Models/Organization');
const Project = require('../Models/Project');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

    // Create project directory
    const projectDir = path.join(__dirname, '..', 'projects', project._id.toString());
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // Prepare project data for pickle file
    const projectData = {
      id: project._id.toString(),
      name: project.name,
      org: org._id.toString(),
      owner: userId,
      createdAt: project.createdAt
    };

    // Execute Python script to create pickle file
    const pythonScriptPath = path.join(__dirname, '..', 'create_pickle.py');
    const pythonProcess = spawn('python', [
      pythonScriptPath,
      JSON.stringify(projectData)
    ], {
      cwd: projectDir
    });

    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonOutput += data.toString();
      console.log('Python output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to spawn Python process:', err);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Pickle file created successfully for project:', project._id);
      } else {
        console.error('Pickle file creation failed with exit code:', code);
      }
    });

    res.json(project);
  } catch (err) {
    console.error('CREATE PROJECT ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});


// Check if pickle file exists
router.get('/o/:orgSlug/proj_:projectId/pickle-status', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const picklePath = path.join(__dirname, '..', 'projects', projectId, 'data.pkl');
    const exists = fs.existsSync(picklePath);
    
    if (exists) {
      const stats = fs.statSync(picklePath);
      res.json({
        status: 'success',
        message: 'Pickle file exists',
        exists: true,
        file: {
          path: picklePath,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        }
      });
    } else {
      res.json({
        status: 'pending',
        message: 'Pickle file not found yet (may still be creating)',
        exists: false,
        path: picklePath
      });
    }
  } catch (err) {
    console.error('PICKLE STATUS ERROR:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// Get pickle file contents as JSON
router.get('/o/:orgSlug/proj_:projectId/pickle-data', authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const picklePath = path.join(__dirname, '..', 'projects', projectId, 'data.pkl');
    
    // Check if file exists
    if (!fs.existsSync(picklePath)) {
      return res.status(404).json({
        status: 'not_found',
        message: 'Pickle file does not exist yet',
        path: picklePath
      });
    }
    
    // Use Python to read pickle file
    const { execSync } = require('child_process');
    const pythonCode = `import pickle; import json; f = open('${picklePath}', 'rb'); data = pickle.load(f); f.close(); print(json.dumps(data, default=str))`;
    
    const result = execSync(`python -c "${pythonCode}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const data = JSON.parse(result);
    
    res.json({
      status: 'success',
      message: 'Pickle file data retrieved',
      data: data
    });
  } catch (err) {
    console.error('PICKLE READ ERROR:', err);
    res.status(500).json({ 
      message: 'Error reading pickle file', 
      error: err.message 
    });
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
