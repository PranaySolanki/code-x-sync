# Save Button State Synchronization Implementation

## Overview
This document describes the implementation of real-time save button state synchronization across all users viewing the same file in your collaborative code editor.

## Technology Stack
- **Frontend**: React with Next.js
- **Real-time Communication**: Supabase Realtime (WebSocket)
- **Database**: Supabase PostgreSQL
- **Code Editor**: Monaco Editor

## Implementation Details

### How It Works

#### 1. **Initial State**
- When a file is first loaded, the save button starts in the "Saved" state (green).
- The `isSaved` state is initialized to `true`.

#### 2. **Dirty State Broadcast**
When a user types in the code editor:
1. **Local Update**: The user's local UI immediately changes from "Saved" to "Save Code"
2. **Broadcast Event**: A `status-dirty` event is broadcast via Supabase Realtime to all users in the same channel
3. **Remote Updates**: All other users receive the event and their save button also changes to "Save Code"

**Code Location**: `src/screen/EditorScreen/EditorContainer.js`
- Lines 241-264: Broadcasting dirty status in `handleEditorChanges`
- Lines 171-178: Listening for dirty status from other users

#### 3. **Saved State Broadcast**
When any user clicks the "Save Code" button:
1. **Database Save**: The code is saved to the `File-Table` in Supabase
2. **Broadcast Event**: After a successful save, a `status-saved` event is broadcast to all users in the channel
3. **Remote Updates**: All users (including the one who saved) receive the event and their button changes back to "Saved"

**Code Location**: `src/screen/EditorScreen/EditorContainer.js`
- Lines 34-91: `manualSave` function that handles saving and broadcasting
- Lines 161-168: Listening for saved status from other users

### Key Features

#### Real-time Communication Channel
```javascript
const channelName = `file_sync:${fileID}`;
const channel = supabase.channel(channelName);
```

The channel name is unique for each file using the pattern `file_sync:{fileID}`.

#### Event Types

1. **`status-dirty`**: Broadcast when code changes
   - Payload: `{ userId, timestamp }`
   - All users update their button to "Save Code"

2. **`status-saved`**: Broadcast after successful save
   - Payload: `{ userId, timestamp }`
   - All users update their button to "Saved"

#### Button States
- **Saved** (Green): Button shows "Saved", disabled hover effect
- **Save Code** (Blue): Button shows "Save Code", active with hover effect

### Visual Feedback

The implementation includes visual feedback:
- **Success Message**: A green notification appears when code is saved successfully
- **Button Color**: Green for "Saved", Blue for "Save Code"
- **Hover Effects**: Different hover states for saved vs unsaved buttons

## Testing the Implementation

1. **Open the same file in two browser windows/tabs** (or different browsers)
2. **Type in one editor**: Notice both buttons change from "Saved" to "Save Code"
3. **Save in one tab**: Click "Save Code" in one tab
4. **Verify synchronization**: Both buttons should return to "Saved" state

## Code Changes Summary

### Modified Files
- `src/screen/EditorScreen/EditorContainer.js`

### Changes Made

1. **Added Event Listeners** (Lines 171-168):
   - Listen for `status-dirty` events
   - Listen for `status-saved` events

2. **Updated `handleEditorChanges`** (Lines 241-264):
   - Set local dirty state when user types
   - Broadcast `status-dirty` event to all users

3. **Updated `manualSave`** (Lines 56-66):
   - Broadcast `status-saved` event after successful database save

4. **Updated Code Change Handler** (Lines 150-168):
   - Mark as dirty when receiving external code changes

## Security Notes

- Each user is authenticated through Supabase Auth
- File access is controlled via project ownership and team email access
- Only authorized users can view and edit files
- The WebSocket connection is secure (WSS) when using HTTPS

## Database Schema

The implementation uses the existing `File-Table`:
```sql
File-Table:
  - file_id (Primary Key)
  - content (Text - the code content)
  - updated_at (Timestamp)
  - file_name
  - extension
  - project_id
```

## Troubleshooting

### Button Not Syncing
- Check that both users are viewing the same file (same `fileID`)
- Verify Supabase Realtime is enabled in your Supabase project
- Check browser console for WebSocket connection errors

### Save Not Working
- Verify user has write permissions (is owner or in team_email)
- Check database connection in Supabase dashboard
- Look for error messages in browser console

### Button Stuck in "Save Code"
- This happens when unsaved changes exist
- Save the code to clear the state
- Or reload the page to reset to saved state

## Future Enhancements

Potential improvements:
- Auto-save functionality with periodic saving
- Visual indicator showing who is currently editing
- Conflict resolution for simultaneous edits
- Save button disabled state for read-only users
- Broadcast save status with username of who saved

