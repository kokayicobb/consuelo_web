const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import models (they'll be created by another Claude)
const Scenario = require('../models/Scenario');
const Character = require('../models/Character'); 
const RoleplaySession = require('../models/RoleplaySession');
const SessionAnalytics = require('../models/SessionAnalytics');
const RoleplayTip = require('../models/RoleplayTip');

// SCENARIO ENDPOINTS

// GET /api/roleplay/scenarios - List all active scenarios with optional text search
router.get('/scenarios', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: 'active' };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const scenarios = await Scenario.find(query)
      .select('title description difficulty category tags estimated_duration')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      scenarios
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenarios'
    });
  }
});

// CHARACTER ENDPOINTS

// GET /api/roleplay/characters - List all active characters with optional role filter
router.get('/characters', async (req, res) => {
  try {
    const { role } = req.query;
    let query = { status: 'active' };
    
    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }
    
    const characters = await Character.find(query)
      .populate('scenario_ids', 'title difficulty')
      .select('name role personality communication_style scenario_ids')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch characters'
    });
  }
});

// SESSION ENDPOINTS

// POST /api/roleplay/sessions - Create new roleplay session
router.post('/sessions', async (req, res) => {
  try {
    const { scenario_id, character_id, user_id } = req.body;
    
    // Validate required fields
    if (!scenario_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'scenario_id and user_id are required'
      });
    }
    
    // Validate scenario exists
    const scenario = await Scenario.findById(scenario_id);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
    }
    
    // Validate character exists if provided
    if (character_id) {
      const character = await Character.findById(character_id);
      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'Character not found'
        });
      }
    }
    
    const session = new RoleplaySession({
      session_id: uuidv4(),
      scenario_id,
      character_id: character_id || null,
      user_id,
      status: 'active',
      conversation: [],
      start_time: new Date()
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session'
    });
  }
});

// GET /api/roleplay/sessions - List sessions with filters/pagination
router.get('/sessions', async (req, res) => {
  try {
    const { user_id, status, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (user_id) query.user_id = user_id;
    if (status) query.status = status;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const [sessions, total] = await Promise.all([
      RoleplaySession.find(query)
        .populate('scenario_id', 'title description difficulty')
        .populate('character_id', 'name role personality')
        .select('session_id scenario_id character_id user_id status start_time end_time total_duration conversation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RoleplaySession.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      sessions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    });
  }
});

// PATCH /api/roleplay/sessions/:id - Update session (status, conversation, etc.)
router.patch('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove protected fields
    delete updateData._id;
    delete updateData.session_id;
    delete updateData.createdAt;
    
    // Auto-calculate duration when status becomes 'completed'/'ended'
    if (updateData.status === 'completed' || updateData.status === 'ended') {
      const session = await RoleplaySession.findById(id);
      if (session && session.start_time) {
        updateData.end_time = new Date();
        updateData.total_duration = Math.round((updateData.end_time - session.start_time) / 1000);
      }
    }
    
    const session = await RoleplaySession.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('scenario_id', 'title description difficulty')
      .populate('character_id', 'name role personality');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

// POST /api/roleplay/sessions/:id/end - End a session
router.post('/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await RoleplaySession.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    const endTime = new Date();
    const totalDuration = session.start_time ? Math.round((endTime - session.start_time) / 1000) : 0;
    
    const updatedSession = await RoleplaySession.findByIdAndUpdate(
      id,
      {
        status: 'ended',
        end_time: endTime,
        total_duration: totalDuration
      },
      { new: true, runValidators: true }
    )
      .populate('scenario_id', 'title description difficulty')
      .populate('character_id', 'name role personality');
    
    res.json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end session'
    });
  }
});

// ANALYTICS ENDPOINTS

// GET /api/roleplay/analytics/:session_id - Get analytics for specific session
router.get('/analytics/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const analytics = await SessionAnalytics.findOne({ session_id })
      .populate('scenario_id', 'title description difficulty');
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Analytics not found for this session'
      });
    }
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// GET /api/roleplay/analytics/summary - Get analytics summary with pagination  
router.get('/analytics/summary', async (req, res) => {
  try {
    const { user_id, limit = 20, page = 1 } = req.query;
    
    let query = {};
    if (user_id) query.user_id = user_id;
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    const [analytics, total] = await Promise.all([
      SessionAnalytics.find(query)
        .populate('scenario_id', 'title description difficulty')
        .select('session_id scenario_id user_id performance_score feedback_rating completion_status key_metrics createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      SessionAnalytics.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      success: true,
      analytics,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary'
    });
  }
});

// TIPS ENDPOINTS

// GET /api/roleplay/tips - Get tips with filters
router.get('/tips', async (req, res) => {
  try {
    const { category, session_id, difficulty_level, featured } = req.query;
    
    let query = { status: 'active' };
    
    if (category) query.category = category;
    if (session_id) query.session_id = session_id;
    if (difficulty_level) query.difficulty_level = difficulty_level;
    if (featured !== undefined) query.featured = featured === 'true';
    
    const tips = await RoleplayTip.find(query)
      .populate('related_scenarios', 'title description difficulty')
      .select('title content category difficulty_level featured related_scenarios tags')
      .sort({ featured: -1, createdAt: -1 });
    
    res.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tips'
    });
  }
});

// GET /api/roleplay/tips/recent - Get recent tips
router.get('/tips/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    
    const tips = await RoleplayTip.find({ status: 'active' })
      .populate('related_scenarios', 'title description difficulty')
      .select('title content category difficulty_level featured related_scenarios tags')
      .sort({ createdAt: -1 })
      .limit(limitNum);
    
    res.json({
      success: true,
      tips
    });
  } catch (error) {
    console.error('Error fetching recent tips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent tips'
    });
  }
});

module.exports = router;