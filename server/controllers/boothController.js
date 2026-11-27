const Booth = require('../models/Booth');
const User = require('../models/User');

// @desc    Exhibitor reserves an available booth
// @route   POST /api/booths/:id/reserve
// @access  Private/Exhibitor
const reserveBooth = async (req, res, next) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ success: false, message: 'Booth not found' });
    }

    if (booth.status !== 'available') {
      return res.status(400).json({ success: false, message: 'This booth is already reserved or booked' });
    }

    const { productsOrServices, boothDescription, staffMembers } = req.body;

    booth.exhibitor = req.user.id;
    booth.status = 'pending_approval';
    booth.showcaseDetails = {
      productsOrServices: productsOrServices || [],
      boothDescription: boothDescription || '',
      staffMembers: staffMembers || [],
    };

    await booth.save();

    res.status(200).json({
      success: true,
      message: 'Booth reservation submitted. Waiting for Admin approval.',
      booth,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approves or rejects a booth reservation
// @route   PUT /api/booths/:id/status
// @access  Private/Admin
const updateBoothApproval = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const booth = await Booth.findById(req.params.id);

    if (!booth) {
      return res.status(404).json({ success: false, message: 'Booth not found' });
    }

    if (action === 'approve') {
      booth.status = 'booked';
      if (booth.exhibitor) {
        await User.findByIdAndUpdate(booth.exhibitor, {
          isVerified: true,
          'exhibitorProfile.approvalStatus': 'approved',
        });
      }
    } else if (action === 'reject') {
      if (booth.exhibitor) {
        await User.findByIdAndUpdate(booth.exhibitor, {
          'exhibitorProfile.approvalStatus': 'rejected',
        });
      }
      booth.status = 'available';
      booth.exhibitor = null;
      booth.showcaseDetails = undefined;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Use approve or reject.' });
    }

    await booth.save();
    res.status(200).json({ success: true, message: `Booth ${action}d successfully`, booth });
  } catch (error) {
    next(error);
  }
};

// @desc    Exhibitor updates their own booked booth showcase details
// @route   PUT /api/booths/:id/showcase
// @access  Private/Exhibitor
const updateBoothShowcase = async (req, res, next) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) {
      return res.status(404).json({ success: false, message: 'Booth not found' });
    }

    if (booth.exhibitor?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own booth' });
    }

    booth.showcaseDetails = {
      ...booth.showcaseDetails,
      ...req.body,
    };

    await booth.save();
    res.status(200).json({ success: true, booth });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Exhibitors/Booths across an Expo (for Attendees)
// @route   GET /api/booths/expo/:expoId
// @access  Public
const getExpoBooths = async (req, res, next) => {
  try {
    const booths = await Booth.find({ expo: req.params.expoId }).populate(
      'exhibitor',
      'name email phone exhibitorProfile'
    );
    res.status(200).json({ success: true, count: booths.length, booths });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reserveBooth,
  updateBoothApproval,
  updateBoothShowcase,
  getExpoBooths,
};