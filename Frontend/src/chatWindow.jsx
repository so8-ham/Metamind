import "./chatWindow.css";
import Chat from "./chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
function ChatWindow() {
  const { prompt, setPrompt, reply, setReply, currentThreadId, prevchats, setprevChats, newchat, setnewChat } = useContext(MyContext);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const getreply = async () => {
    setLoading(true);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currentThreadId
      })
    };
    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      const res = await response.json();
      console.log(res);
      setReply(res.reply);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  // Fetch history when thread changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentThreadId || !token) return;

      try {
        const response = await fetch(`http://localhost:8080/api/thread/${currentThreadId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const messages = await response.json();
          // Convert from backend schema (User/assistant) to frontend role (user/assistant)
          const formattedMessages = messages.map(msg => ({
            role: msg.role.toLowerCase(),
            content: msg.content
          }));
          setprevChats(formattedMessages);
          if (formattedMessages.length > 0) {
            setnewChat(false);
          }
        } else {
          // If 404, it might be a new chat that's not in DB yet
          setprevChats([]);
        }
      } catch (err) {
        console.log("Failed to fetch thread history:", err);
      }
    };

    fetchHistory();
  }, [currentThreadId, token]);

  //Append new chats to previous chats..
  useEffect(() => {
    if (prompt && reply) {
      setnewChat(false);
      setprevChats(prevchats => (
        [...prevchats, {
          role: "user",
          content: prompt,
        }, {
          role: "assistant",
          content: reply,
        }]
      ));
    }
    setPrompt("");
  }, [reply]);

  return (
    <>
      <div className="chatwindow">
        <div className="navbar">
          <span>Metamind<i class="fa-solid fa-angle-down"></i></span>
          <div className="userIcon">
            <span> <i class="fa-solid fa-user userlogo"></i></span>
          </div>
        </div>
        <Chat></Chat>
        <ScaleLoader color="#fff" loading={loading}>

        </ScaleLoader>
        <div className="chatInput">
          <div className="userInput">
            <input placeholder="Ask anything"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" ? getreply() : ""}>

            </input>
            <div id="submit" onClick={getreply}><i class="fa-solid fa-paper-plane"></i></div>
          </div>
          <p className="info">
            Metamind can make mistakes. Check important info.See Cookies Preferences.
          </p>
        </div>
      </div>
    </>
  )
}

export default ChatWindow;
