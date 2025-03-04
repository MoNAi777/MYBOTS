-- SQL Server compatible version of create_tables.sql
-- Use this file if you're using Microsoft SQL Server instead of PostgreSQL/Supabase

-- Create the Message table for SQL Server
CREATE TABLE [Message] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [content] NVARCHAR(MAX) NOT NULL,
  [source] NVARCHAR(255) NOT NULL,
  [type] NVARCHAR(255) NOT NULL,
  [category] NVARCHAR(255) NULL,
  [tags] NVARCHAR(MAX) NULL, -- JSON array stored as string
  [createdAt] DATETIME2 DEFAULT GETDATE(),
  [starred] BIT DEFAULT 0,
  [metadata] NVARCHAR(MAX) NULL -- JSON stored as string
);

-- Create indexes for better query performance
CREATE INDEX [Message_source_idx] ON [Message] ([source]);
CREATE INDEX [Message_type_idx] ON [Message] ([type]);
CREATE INDEX [Message_category_idx] ON [Message] ([category]);
CREATE INDEX [Message_createdAt_idx] ON [Message] ([createdAt]);
CREATE INDEX [Message_starred_idx] ON [Message] ([starred]);

-- Note: SQL Server doesn't have Row Level Security in the same way as PostgreSQL
-- You would need to implement security through views and stored procedures
-- or use SQL Server 2016+ Row-Level Security features with different syntax 