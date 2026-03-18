import User from '../models/userModel.js';
import AdminLog from '../models/adminLogModel.js';

export const getUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can access this' });
    const users = await User.find().sort({ created_at: -1 });
    return res.json(users);
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can update roles' });
    const { id } = req.params; // user_id (string)
    const { role } = req.body;
    if (!['buyer', 'seller', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const user = await User.findOne({ user_id: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent admin from demoting themselves to non-admin (avoid lockout)
    if (req.user.user_id === id && role !== 'admin') {
      return res.status(400).json({ message: 'Bạn không thể hạ quyền admin của chính mình' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Create admin log
    try {
      await AdminLog.create({
        log_id: 'LG' + Date.now(),
        admin_id: req.user.user_id,
        action: 'update_role',
        target: id,
        description: `Changed role from ${oldRole} to ${role}`,
      });
    } catch (logErr) {
      console.error('Could not create admin log for updateUserRole:', logErr);
    }

    return res.json({ message: 'Role updated', user });

  } catch (err) {
    console.error('updateUserRole error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can delete users' });
    const { id } = req.params; // user_id
    const user = await User.findOne({ user_id: id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // prevent admin from deleting themselves
    if (req.user.user_id === id) {
      return res.status(400).json({ message: 'Bạn không thể xóa chính mình' });
    }
    await user.deleteOne();

    // Create admin log
    try {
      await AdminLog.create({
        log_id: 'LG' + Date.now(),
        admin_id: req.user.user_id,
        action: 'delete_user',
        target: id,
        description: `Deleted user ${id}`,
      });
    } catch (logErr) {
      console.error('Could not create admin log for deleteUser:', logErr);
    }
    return res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserRoles = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can access this' });
    // Aggregate counts per role
    const data = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const result = data.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    const total = await User.countDocuments();
    return res.json({ total, counts: result });
  } catch (err) {
    console.error('getUserRoles error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
