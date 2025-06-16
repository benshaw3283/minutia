-- Create enum for frequency
CREATE TYPE notification_frequency AS ENUM ('daily', 'weekly');

-- Create content_preferences table
CREATE TABLE content_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    prompt TEXT NOT NULL,
    notification_time TIME NOT NULL,
    frequency notification_frequency NOT NULL DEFAULT 'daily',
    parameters JSONB DEFAULT '{}',
    last_notification_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Add index for faster queries
CREATE INDEX idx_content_preferences_user_id ON content_preferences(user_id);
CREATE INDEX idx_content_preferences_notification_time ON content_preferences(notification_time);

-- Add function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_content_preferences_updated_at
    BEFORE UPDATE ON content_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
