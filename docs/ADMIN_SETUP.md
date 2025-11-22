# Admin System Setup Guide

VoteHub now includes a comprehensive admin system for managing users, topics, verifications, and monitoring platform activity.

## Admin Features

### Dashboard
- Real-time statistics (users, topics, votes, pending verifications)
- Visual stat cards with color-coded metrics

### User Management
- View all users with verification status
- Search users by username or email
- Update user verification levels
- View user demographics and admin notes

### Topic Management
- View all topics across the platform
- Monitor vote counts and activity
- Delete inappropriate topics with reason logging

### Verification System
- Review pending verification requests
- Approve or reject with notes
- Track verification history
- Automatic profile updates on approval

### Activity Logs
- Audit trail of all admin actions
- Track who did what and when
- IP address and user agent logging
- Searchable action history

## Setting Up Your First Admin

### Method 1: Direct Database Update (Recommended for First Admin)

1. Create your account through the normal signup process

2. Go to your Supabase Dashboard:
   - Navigate to **SQL Editor**

3. Find your user ID:
   ```sql
   SELECT id, email, username FROM profiles
   WHERE email = 'your-email@example.com';
   ```

4. Promote yourself to super admin:
   ```sql
   UPDATE profiles
   SET
     is_admin = true,
     admin_level = 'super_admin'
   WHERE email = 'your-email@example.com';
   ```

5. Refresh your application
   - You should now see "Admin Panel" in your user dropdown menu

### Method 2: Using SQL Function (For Subsequent Admins)

Once you have a super admin account, you can promote other users using the built-in function:

```sql
SELECT promote_to_admin(
  'target-user-id-here'::uuid,
  'moderator'  -- or 'admin', 'super_admin'
);
```

## Admin Levels

### None (Default)
- Regular user
- No admin access

### Moderator
- Can review verification requests
- Can view reports
- Cannot delete users or topics

### Admin
- All moderator permissions
- Can delete topics
- Can view all admin logs
- Can manage most platform settings

### Super Admin
- All admin permissions
- Can promote/demote other admins
- Can delete users
- Full platform control

## Admin Access

Once promoted to admin, access the admin panel via:

1. **User Menu**: Click your avatar → "Admin Panel"
2. **Direct Navigation**: The admin link appears only for admin users

## Admin Dashboard Tabs

### Dashboard
- Total users count
- Total topics count
- Total votes cast
- Pending verifications (with alert badge)

### Users
- Searchable user list
- Verification status badges
- User details and creation dates
- Quick actions (view, update, delete)

### Topics
- All platform topics
- Creator information
- Vote counts and types
- Delete functionality with reason tracking

### Verifications
- Pending verification requests
- User information and request details
- Approve/Reject with notes
- Status tracking (pending, approved, rejected)

### Activity Log
- All admin actions logged
- Filterable by admin, action type, target
- Timestamp tracking
- Complete audit trail

## Security Features

### RLS Policies
- Only admins can access admin tables
- All admin actions require authentication
- Admin status checked on every request

### Action Logging
- Every admin action is logged
- Cannot be deleted by admins
- Includes IP address and user agent
- Permanent audit trail

### Permission Checks
- Functions verify admin status before execution
- Super admin required for promoting users
- Level-based permissions (moderator < admin < super_admin)

## Common Admin Tasks

### Approving Verification Requests

1. Go to Admin Panel → Verifications tab
2. Review user information and request type
3. Click "Approve" to verify user
4. Optionally add review notes
5. User automatically gets verified status and level

### Managing Inappropriate Content

1. Go to Admin Panel → Topics tab
2. Find the topic to remove
3. Click delete button
4. Enter reason for deletion (logged)
5. Topic and all associated votes removed

### Searching for Users

1. Go to Admin Panel → Users tab
2. Enter username or email in search box
3. Press Enter or click Search button
4. Results filter in real-time

### Viewing Platform Activity

1. Go to Admin Panel → Activity Log tab
2. Review recent admin actions
3. Check timestamps and action details
4. Monitor for unusual activity

## Admin Best Practices

### Security
1. **Protect Super Admin Accounts**: Only give to trusted individuals
2. **Use Strong Passwords**: Enable 2FA when available
3. **Monitor Activity Logs**: Regularly review admin actions
4. **Limit Admin Count**: Only promote when necessary
5. **Document Changes**: Use action notes for major changes

### User Management
1. **Fair Verification**: Review requests promptly
2. **Clear Communication**: Use review notes to explain decisions
3. **Consistent Standards**: Apply verification rules equally
4. **Privacy Respect**: Handle user data with care
5. **Appeal Process**: Allow users to appeal rejections

### Content Moderation
1. **Document Deletions**: Always provide reason
2. **Warning First**: Consider warnings before deletion
3. **Consistent Rules**: Apply content policies equally
4. **Quick Response**: Address reports promptly
5. **Transparency**: Be clear about moderation policies

## Troubleshooting

### "Admin Panel" Not Showing

**Check:**
1. Verify your account has `is_admin = true` in database
2. Refresh the page after database update
3. Clear browser cache and localStorage
4. Sign out and sign back in

**SQL to verify:**
```sql
SELECT is_admin, admin_level
FROM profiles
WHERE id = auth.uid();
```

### Cannot Access Admin Features

**Possible causes:**
1. Not signed in
2. Admin status not properly set
3. RLS policies blocking access (check Supabase logs)
4. Session expired (sign out and back in)

### Action Logging Not Working

**Check:**
1. Supabase connection is active
2. `admin_actions` table exists
3. RLS policies allow INSERT for admins
4. Check browser console for errors

## Admin API Access

For programmatic access, use the admin service:

```typescript
import { adminService } from './services/adminService';

// Check if current user is admin
const isAdmin = await adminService.isAdmin();

// Get admin level
const level = await adminService.getAdminLevel();

// Get platform stats
const stats = await adminService.getStats();

// Approve verification
await adminService.approveVerificationRequest(requestId, 'Verified via ID');

// Log custom action
await adminService.logAction('custom_action', 'custom_target', targetId, {
  details: 'Some custom data'
});
```

## Database Schema

### Profiles Table (Extended)
```sql
profiles {
  id uuid PK
  username text
  email text
  is_admin boolean DEFAULT false
  admin_level text DEFAULT 'none'
  admin_notes text
  -- ... other fields
}
```

### Verification Requests Table
```sql
verification_requests {
  id uuid PK
  profile_id uuid FK
  request_type text
  status text
  reviewed_by uuid FK
  reviewed_at timestamptz
  review_notes text
  -- ... timestamps
}
```

### Admin Actions Table
```sql
admin_actions {
  id uuid PK
  admin_id uuid FK
  action_type text
  target_type text
  target_id uuid
  action_data jsonb
  ip_address inet
  user_agent text
  created_at timestamptz
}
```

## Advanced Configuration

### Customizing Admin Levels

Edit the migration file to add custom admin levels:

```sql
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_admin_level_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_admin_level_check
CHECK (admin_level IN ('none', 'moderator', 'admin', 'super_admin', 'your_custom_level'));
```

### Adding Custom Admin Actions

Update `adminService.ts` to add new admin functions:

```typescript
async customAdminAction(param: string): Promise<void> {
  // Perform action

  // Log it
  await this.logAction('custom_action', 'target_type', targetId, {
    param: param
  });
}
```

## Support

For admin-related issues:
- Check Supabase Dashboard logs
- Review RLS policies in Database section
- Verify migrations were applied correctly
- Contact support with admin action logs

---

**Important**: The admin system is powerful. Use responsibly and always maintain an audit trail of actions taken.