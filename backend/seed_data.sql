-- Seed data for Deep Work Session Tracker

-- Insert sample sessions
INSERT INTO sessions (title, goal, scheduled_duration, status, created_at)
VALUES 
    ('Write Project Documentation', 'Complete API documentation', 60, 'scheduled', datetime('now', '-2 days')),
    ('Code Review', 'Review pull requests', 45, 'scheduled', datetime('now', '-1 day')),
    ('Bug Fixing', 'Fix critical bugs in authentication module', 90, 'scheduled', datetime('now', '-12 hours'));

-- Insert a completed session
INSERT INTO sessions (title, goal, scheduled_duration, status, start_time, end_time, created_at)
VALUES 
    ('Database Schema Design', 'Design schema for new feature', 50, 'completed', datetime('now', '-3 hours'), datetime('now', '-2 hours'), datetime('now', '-5 hours'));

-- Insert a session with interruptions
INSERT INTO sessions (title, goal, scheduled_duration, status, start_time, created_at)
VALUES 
    ('Frontend Development', 'Implement user dashboard', 120, 'paused', datetime('now', '-1 hour'), datetime('now', '-2 hours'));

-- Insert interruptions for the paused session
INSERT INTO interruptions (session_id, reason, pause_time)
VALUES 
    (5, 'Phone call from client', datetime('now', '-30 minutes'));

-- Insert an overdue session
INSERT INTO sessions (title, goal, scheduled_duration, status, start_time, end_time, created_at)
VALUES 
    ('API Integration', 'Integrate payment gateway', 30, 'overdue', datetime('now', '-2 hours'), datetime('now', '-30 minutes'), datetime('now', '-3 hours'));

-- Insert an interrupted session (more than 3 pauses)
INSERT INTO sessions (title, goal, scheduled_duration, status, start_time, created_at)
VALUES 
    ('Performance Optimization', 'Optimize database queries', 60, 'interrupted', datetime('now', '-5 hours'), datetime('now', '-6 hours'));

-- Insert interruptions for the interrupted session
INSERT INTO interruptions (session_id, reason, pause_time)
VALUES 
    (7, 'Urgent email from manager', datetime('now', '-4 hours, -45 minutes')),
    (7, 'Team meeting', datetime('now', '-4 hours, -15 minutes')),
    (7, 'Production issue', datetime('now', '-3 hours, -30 minutes')),
    (7, 'Slack notification', datetime('now', '-3 hours'));

-- Insert an abandoned session
INSERT INTO sessions (title, goal, scheduled_duration, status, start_time, created_at)
VALUES 
    ('Documentation Review', 'Review user guide', 45, 'abandoned', datetime('now', '-1 day'), datetime('now', '-1 day, -2 hours'));

-- Insert interruption for the abandoned session
INSERT INTO interruptions (session_id, reason, pause_time)
VALUES 
    (8, 'Emergency meeting', datetime('now', '-1 day, +30 minutes'));
