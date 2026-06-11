import express from "express";
import Thread from "../models/Thread.js"
const router = express.Router();
import getMistralAPIResponse from "../utils/mistral.js";
import authMiddleware from "../middleware/authMiddleware.js";


//Get all threads....

router.get("/thread", authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    //desending Order updatedAt....most recent data...
    res.json(threads);

  } catch (e) {
    console.log(e);
    res.status(500).json({ err: "failed to fetch threads" });
  }
});

//find route...
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId, userId: req.user._id });
    if (!thread) {
      return res.status(404).json({ error: "Thread is not found" });
    }
    res.json(thread.messages);

  } catch (e) {
    console.log(e);
    res.status(500).json({ err: "failed to fetch threads to their id" });
  }
})

//Delete route...
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user._id });
    if (!deletedThread) {
      return res.status(404).json({ error: "Thread could not be deleted" });
    }
    res.status(200).json({ success: "Thread deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ err: "failed to delete threads to their id" });
  }
});

router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing some required field" });
  }
  try {
    let thread = await Thread.findOne({ threadId, userId: req.user._id });
    let messagesForModel;

    if (!thread) {
      // create new thread in Db
      thread = new Thread({
        userId: req.user._id,
        threadId,
        title: message,
        messages: [{ role: "User", content: message }],
      });
      messagesForModel = [{ role: "user", content: message }];
    } else {
      thread.messages.push({ role: "User", content: message });
      messagesForModel = thread.messages.map((msg) => ({
        role: msg.role.toLowerCase(),
        content: msg.content,
      }));
    }

    const reply = await getMistralAPIResponse(messagesForModel);

    thread.messages.push({ role: "assistant", content: reply });
    thread.updatedAt = new Date();
    await thread.save();
    res.json({ reply });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "something went wrong" });
  }
});
export default router;