

// src/api/service/chatApi.js
import API from "../axios";

export const chatApi = {
  // ── Group Channels ─────────────────────────────────────────────────────────

  /** List all channels (group + DM) the current employee belongs to */
  listChannels: () => API.get("/chat/channels").then((r) => r.data),

  /** Managers only: create a group channel */
  createChannel: (payload) =>
    API.post("/chat/channels", payload).then((r) => r.data),

  /** Get channel detail + members */
  getChannel: (id) => API.get(`/chat/channels/${id}`).then((r) => r.data),

  /** Managers only: soft-close a channel */
  closeChannel: (id) =>
    API.put(`/chat/channels/${id}/close`).then((r) => r.data),

  // ── Members (managers only) ────────────────────────────────────────────────

  addMembers: (channelId, employeeIds) =>
    API.post(`/chat/channels/${channelId}/members`, { employeeIds }).then(
      (r) => r.data,
    ),

  removeMember: (channelId, empId) =>
    API.delete(`/chat/channels/${channelId}/members/${empId}`).then(
      (r) => r.data,
    ),

  // ── Messages ──────────────────────────────────────────────────────────────

  /** Fetch messages for any channel (group or DM) */
  getMessages: (channelId, params = {}) =>
    API.get(`/chat/channels/${channelId}/messages`, { params }).then(
      (r) => r.data,
    ),

  /**
   * Send a plain text message to any channel (group or DM).
   * @param {string} channelId
   * @param {string} body
   */
  sendText: (channelId, body) =>
    API.post(`/chat/channels/${channelId}/messages`, { body }).then(
      (r) => r.data,
    ),

  /**
   * Send a file (document / image) to any channel (group or DM).
   * @param {string} channelId
   * @param {File}   file
   * @param {string} [caption]
   */
  sendDocument: (channelId, file, caption = "") => {
    const fd = new FormData();
    fd.append("file", file);
    if (caption) fd.append("body", caption);
    return API.post(`/chat/channels/${channelId}/messages`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  /** Soft-delete a message (own message or admin) */
  deleteMessage: (id) =>
    API.delete(`/chat/messages/${id}`).then((r) => r.data),

  // ── Direct Messages ────────────────────────────────────────────────────────

  /**
   * Open or create a DM channel with a specific employee.
   * Returns { channel, targetEmployee, messages }
   * @param {string} targetEmployeeId  UUID of the employee to DM
   */
  openDM: (targetEmployeeId) =>
    API.post(`/chat/dm/${targetEmployeeId}`).then((r) => r.data),

  /**
   * List all existing DM threads for the current user.
   * Returns { dms: [{ id, otherEmployeeId, otherName, otherRole, ... }] }
   */
  listDMs: () => API.get("/chat/dm/list").then((r) => r.data),
};