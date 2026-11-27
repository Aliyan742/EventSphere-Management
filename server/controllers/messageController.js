const Message = require("../models/Message");

// @desc    Send message / inquiry / appointment / support ticket
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const {
      expo,
      receiver,
      messageType,
      subject,
      content,
      appointmentDetails,
    } = req.body;

    const message = await Message.create({
      expo,
      sender: req.user.id,
      receiver,
      messageType,
      subject,
      content,
      appointmentDetails,
    });

    const io = req.app.get("io");
    if (io && receiver) {
      io.to(String(receiver)).emit("new_message", {
        threadId: message._id,
        subject: message.subject,
        senderName: req.user.name,
        messageType: message.messageType,
      });
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Inbox & Sent messages for logged-in user
// @route   GET /api/messages/my
// @access  Private
const getMyMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
      deletedBy: { $ne: userId },
    })
      .populate("sender", "name email role avatar exhibitorProfile.companyName")
      .populate(
        "receiver",
        "name email role avatar exhibitorProfile.companyName",
      )
      .populate({
        path: "replies.sender",
        select: "name role avatar exhibitorProfile.companyName",
        strictPopulate: false,
      })
      .populate("expo", "title")
      .sort({ updatedAt: -1 });

    const filteredMessages = messages.map((m) => {
      const obj = m.toObject();
      obj.replies = (obj.replies || []).filter(
        (r) =>
          !(r.deletedBy || []).some(
            (id) => id.toString() === userId.toString(),
          ),
      );
      return obj;
    });

    res.status(200).json({
      success: true,
      count: filteredMessages.length,
      messages: filteredMessages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to any message thread (Admin, Exhibitor, or Attendee)
// @route   POST /api/messages/:id/reply
// @access  Private
const replyToMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    const isParticipant =
      message.sender.toString() === req.user.id ||
      message.receiver.toString() === req.user.id;

    if (!isParticipant) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to reply" });
    }

    // Mark as unread for the OTHER recipient
    message.isRead = false;
    message.replies.push({
      sender: req.user.id,
      content: req.body.content,
    });
    await message.save();

    const io = req.app.get("io");
    if (io) {
      const recipientId =
        message.sender.toString() === req.user._id.toString()
          ? message.receiver.toString()
          : message.sender.toString();

      io.to(recipientId).emit("new_message", {
        threadId: message._id,
        subject: message.subject,
        senderName: req.user.name,
        isReply: true,
      });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Exhibitor confirms/declines)
// @route   PUT /api/messages/:id/appointment
// @access  Private/Exhibitor
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    if (message.receiver.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    message.appointmentDetails.status = req.body.status;
    message.isRead = true;
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all incoming unread threads as read & notify senders
// @route   PUT /api/messages/mark-read
// @access  Private
const markMessagesRead = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    const unreadThreads = await Message.find({
      $or: [{ receiver: req.user._id }, { sender: req.user._id }],
      isRead: false,
    });

    const io = req.app.get("io");
    const updatedIds = [];

    for (const thread of unreadThreads) {
      const hasReplies = thread.replies && thread.replies.length > 0;
      const lastSenderId = hasReplies
        ? thread.replies[thread.replies.length - 1].sender.toString()
        : thread.sender.toString();

      if (lastSenderId !== userId) {
        thread.isRead = true;
        await thread.save();
        updatedIds.push(thread._id);

        if (io) {
          io.to(lastSenderId).emit("messages_seen", {
            threadId: thread._id,
            seenBy: userId,
          });
        }
      }
    }

    res.status(200).json({ success: true, markedCount: updatedIds.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete entire thread ONLY for the requesting user (Delete for Me)
// @route   DELETE /api/messages/:id
// @access  Private
const deleteThreadForMe = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Thread not found" });
    }
    if (!message.deletedBy.includes(req.user._id)) {
      message.deletedBy.push(req.user._id);
      await message.save();
    }
    res
      .status(200)
      .json({ success: true, message: "Conversation removed from your inbox" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single reply bubble ONLY for the requesting user
// @route   DELETE /api/messages/:id/replies/:replyId
// @access  Private
const deleteReplyForMe = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Thread not found" });
    }
    const reply = message.replies.id(req.params.replyId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, message: "Reply not found" });
    }
    if (!reply.deletedBy) reply.deletedBy = [];
    if (!reply.deletedBy.includes(req.user._id)) {
      reply.deletedBy.push(req.user._id);
      await message.save();
    }
    res.status(200).json({ success: true, message: "Message deleted for you" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMyMessages,
  updateAppointmentStatus,
  replyToMessage,
  markMessagesRead,
  deleteThreadForMe,
  deleteReplyForMe,
};
