import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  MessageSquare,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import socket from "../services/socket";

const getRoleBadge = (person) => {
  if (!person) {
    return {
      label: "User",
      color: "bg-slate-100 text-slate-600 border-slate-200",
    };
  }
  if (person.role === "admin") {
    return {
      label: "Organizer",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  if (person.role === "exhibitor") {
    return {
      label: person.exhibitorProfile?.companyName || "Exhibitor",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  return {
    label: "Attendee",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
};

const UserAvatar = ({ person, size = "w-8 h-8 text-xs" }) => {
  const valid =
    person?.avatar &&
    person.avatar !== "default-avatar.png" &&
    !person.avatar.startsWith("data:image/svg");
  return valid ? (
    <img
      src={person.avatar}
      alt={person.name || "User"}
      className={`${size} rounded-full object-cover border border-slate-200 shrink-0`}
    />
  ) : (
    <span
      className={`${size} rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0`}
    >
      {(person?.name || "U").charAt(0).toUpperCase()}
    </span>
  );
};

const MessageCenter = ({
  messages = [],
  onRefresh,
  title = "Inbox & Messages",
  headerAction = null,
}) => {
  const { user } = useAuth();
  const currentUserId = (user?.id || user?._id)?.toString();
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const chatContainerRef = useRef(null);

  const filteredThreads = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => {
      const sName = m.sender?.name?.toLowerCase() || "";
      const rName = m.receiver?.name?.toLowerCase() || "";
      const subj = m.subject?.toLowerCase() || "";
      return sName.includes(q) || rName.includes(q) || subj.includes(q);
    });
  }, [messages, searchTerm]);

  // Derive active message cleanly without cascading setState in useEffect
  const activeMsg = useMemo(() => {
    if (messages.length === 0) return null;
    return (
      messages.find((m) => m._id === selectedThreadId) ||
      filteredThreads[0] ||
      messages[0]
    );
  }, [messages, selectedThreadId, filteredThreads]);

  // Scroll only inside the chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [activeMsg?._id, messages]);

  useEffect(() => {
    if (!currentUserId) return;
    socket.emit("join_user_room", currentUserId);
    api.put("/messages/mark-read").catch(() => {});

    const handleOnlineUsers = (ids) => setOnlineUserIds(ids || []);
    const handleIncomingMessage = () => {
      api.put("/messages/mark-read").catch(() => {});
      if (onRefresh) onRefresh();
    };
    const handleSeenReceipt = () => {
      if (onRefresh) onRefresh();
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("new_message", handleIncomingMessage);
    socket.on("messages_seen", handleSeenReceipt);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.off("new_message", handleIncomingMessage);
      socket.off("messages_seen", handleSeenReceipt);
    };
  }, [currentUserId, onRefresh]);

  const handleSelectThread = (id) => {
    setSelectedThreadId(id);
    setMobileView("chat");
  };

  const handleReplySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!activeMsg || !replyText.trim()) return;

    setSending(true);
    try {
      await api.post(`/messages/${activeMsg._id}/reply`, {
        content: replyText,
      });
      setReplyText("");
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteThreadForMe = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMobileView("list");
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const handleDeleteReplyForMe = async (messageId, replyId) => {
    try {
      await api.delete(`/messages/${messageId}/replies/${replyId}`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleAppointmentAction = async (messageId, status) => {
    try {
      await api.put(`/messages/${messageId}/appointment`, { status });
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Appointment update failed:", err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Unified Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {title} ({messages.length})
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {headerAction}
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          No conversations yet. Start a message or appointment inquiry to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 md:h-[540px] overflow-hidden">
          {/* LEFT SIDEBAR: THREAD LIST */}
          <div
            className={`${
              mobileView === "chat" ? "hidden md:flex" : "flex"
            } md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 flex-col h-[460px] md:h-[540px] overflow-hidden`}
          >
            <div className="p-3 border-b border-slate-200 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-200/70 flex-1 min-h-0 overflow-y-auto">
              {filteredThreads.map((m) => {
                const sId = (m.sender?._id || m.sender)?.toString();
                const rId = (m.receiver?._id || m.receiver)?.toString();
                const isMe = sId === currentUserId;
                const peer = isMe ? m.receiver : m.sender;
                const peerId = isMe ? rId : sId;
                const peerOnline = onlineUserIds.includes(peerId);
                const peerBadge = getRoleBadge(peer);
                const isSelected = activeMsg?._id === m._id;

                const lastText =
                  m.replies && m.replies.length > 0
                    ? m.replies[m.replies.length - 1].content
                    : m.content;

                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => handleSelectThread(m._id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-blue-50/90 border-l-3 border-l-blue-600"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <UserAvatar
                            person={peer}
                            size="w-7 h-7 text-[11px]"
                          />
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              peerOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {peer?.name || "User"}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded border font-semibold text-[10px] shrink-0 max-w-[110px] truncate ${peerBadge.color}`}
                      >
                        {peerBadge.label}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-blue-700 truncate">
                      {m.subject}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {lastText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE: ACTIVE CONVERSATION */}
          {activeMsg &&
            (() => {
              const senderId = (
                activeMsg.sender?._id || activeMsg.sender
              )?.toString();
              const receiverId = (
                activeMsg.receiver?._id || activeMsg.receiver
              )?.toString();
              const isSenderMe = senderId === currentUserId;
              const otherParty = isSenderMe
                ? activeMsg.receiver
                : activeMsg.sender;
              const otherPartyId = isSenderMe ? receiverId : senderId;
              const isOtherOnline = onlineUserIds.includes(otherPartyId);
              const otherBadge = getRoleBadge(otherParty);

              const apptDate =
                activeMsg.appointmentDetails?.preferredDate ||
                activeMsg.appointmentDetails?.requestedDate;
              const apptStatus =
                activeMsg.appointmentDetails?.status || "requested";

              return (
                <div
                  className={`${
                    mobileView === "list" ? "hidden md:flex" : "flex"
                  } md:col-span-8 flex-col h-[500px] md:h-[540px] overflow-hidden bg-white`}
                >
                  {/* Active Chat Header */}
                  <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-white shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => setMobileView("list")}
                        className="md:hidden p-1.5 rounded-lg bg-slate-100 text-slate-700 cursor-pointer shrink-0"
                        aria-label="Back to conversations"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <UserAvatar person={otherParty} size="w-9 h-9 text-xs" />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {otherParty?.name || "Conversation"}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded border font-semibold text-[10px] ${otherBadge.color}`}
                          >
                            {otherBadge.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              isOtherOnline
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOtherOnline
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {isOtherOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          Subject:{" "}
                          <span className="text-slate-700 font-medium">
                            {activeMsg.subject}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] capitalize font-semibold">
                        {activeMsg.messageType?.replace("_", " ")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteThreadForMe(activeMsg._id)}
                        title="Delete conversation for me"
                        className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Appointment Banner */}
                  {apptDate && (
                    <div className="px-4 sm:px-5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
                      <div className="flex items-center gap-2 text-blue-800 font-semibold">
                        <CalendarClock className="w-4 h-4 shrink-0" />
                        <span>
                          Requested Slot:{" "}
                          {new Date(apptDate).toLocaleDateString()}
                          {activeMsg.appointmentDetails?.timeSlot
                            ? ` at ${activeMsg.appointmentDetails.timeSlot}`
                            : ""}
                        </span>
                        <span className="uppercase font-semibold text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {apptStatus}
                        </span>
                      </div>

                      {activeMsg.messageType === "appointment" &&
                        !isSenderMe &&
                        (apptStatus === "requested" ||
                          apptStatus === "pending") && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleAppointmentAction(
                                  activeMsg._id,
                                  "confirmed",
                                )
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleAppointmentAction(
                                  activeMsg._id,
                                  "declined",
                                )
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Scrollable Messages Feed */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 min-h-0 p-4 sm:p-5 space-y-3.5 bg-slate-50/60 overflow-y-auto"
                  >
                    {/* Initial Message */}
                    <div
                      className={`flex flex-col ${isSenderMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[11px] font-medium text-slate-500 mb-1 px-1 flex items-center gap-1.5">
                        <span>
                          {isSenderMe ? "You" : activeMsg.sender?.name} •{" "}
                          {new Date(activeMsg.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {isSenderMe &&
                          (activeMsg.isRead ||
                          activeMsg.replies?.some(
                            (r) =>
                              (r.sender?._id || r.sender)?.toString() !==
                              currentUserId,
                          ) ? (
                            <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                              <CheckCheck className="w-3.5 h-3.5" /> Seen
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-slate-400">
                              <Check className="w-3.5 h-3.5" /> Sent
                            </span>
                          ))}
                      </span>
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isSenderMe
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs"
                        }`}
                      >
                        {activeMsg.content}
                      </div>
                    </div>

                    {/* Replies */}
                    {activeMsg.replies?.map((rep, idx) => {
                      const repSenderId = (
                        rep.sender?._id || rep.sender
                      )?.toString();
                      const isRepMe = repSenderId === currentUserId;
                      const hasOtherRepliedAfter = activeMsg.replies
                        .slice(idx + 1)
                        .some(
                          (laterRep) =>
                            (
                              laterRep.sender?._id || laterRep.sender
                            )?.toString() !== currentUserId,
                        );
                      const isRepSeen =
                        activeMsg.isRead || hasOtherRepliedAfter;

                      return (
                        <div
                          key={rep._id || idx}
                          className={`flex flex-col ${isRepMe ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[11px] font-medium text-slate-500 mb-1 px-1 flex items-center gap-1.5">
                            <span>
                              {isRepMe ? "You" : rep.sender?.name || "Reply"}
                              {rep.createdAt &&
                                ` • ${new Date(
                                  rep.createdAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`}
                            </span>
                            {isRepMe &&
                              (isRepSeen ? (
                                <span className="inline-flex items-center gap-0.5 text-blue-600 font-semibold">
                                  <CheckCheck className="w-3.5 h-3.5" /> Seen
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-slate-400">
                                  <Check className="w-3.5 h-3.5" /> Sent
                                </span>
                              ))}
                            {rep._id && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteReplyForMe(activeMsg._id, rep._id)
                                }
                                title="Delete message for me"
                                className="opacity-70 hover:opacity-100 text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                          <div
                            className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isRepMe
                                ? "bg-blue-600 text-white rounded-br-xs"
                                : "bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs"
                            }`}
                          >
                            {rep.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Bar */}
                  <form
                    onSubmit={handleReplySubmit}
                    className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold text-white cursor-pointer transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sending ? "Sending..." : "Send"}</span>
                    </button>
                  </form>
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
};

export default MessageCenter;
