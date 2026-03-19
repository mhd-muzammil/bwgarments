const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ action, actor, targetType, targetId, description, metadata }) => {
  try {
    await ActivityLog.create({ action, actor, targetType, targetId, description, metadata });
  } catch (err) {
    // Don't let logging failures break the app
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
