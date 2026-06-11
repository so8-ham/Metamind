import "./chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
function Chat() {
  const { newchat, prevchats, reply } = useContext(MyContext);
  const [latestreply, setlatestReply] = useState(null);

  useEffect(() => {
    if (!prevchats?.length || !reply) return;

    let idx = 0;
    const interval = setInterval(() => {
      setlatestReply(reply.slice(0, idx + 1));
      idx++;
      if (idx >= reply.length) clearInterval(interval);
    }, 30)

    return () => clearInterval(interval);

  }, [prevchats, reply]);
  return (
    <>
      {newchat && <h1>Start a New Chat</h1>}
      <div className="chats">
        {
          prevchats?.map((Chat, idx) => {
            // If this is the last message and it's the one currently being typed, skip rendering it here
            if (idx === prevchats.length - 1 && Chat.role === "assistant" && reply === Chat.content) {
              return null;
            }
            return (
              <div className={Chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                {
                  Chat.role === "user" ?
                    <div className="userMessage">{Chat.content}</div> :
                    <div style={{ width: "100%", maxWidth: "800px" }}>
                      <ReactMarkdown rehypePlugins={rehypeHighlight}>{Chat.content}</ReactMarkdown>
                    </div>
                }
              </div>
            )
          })
        }
        {
          latestreply != null &&
          <div className="gptDiv" key={"typing"}>
            <div style={{ width: "100%", maxWidth: "800px" }}>
              <ReactMarkdown rehypePlugins={rehypeHighlight}>{latestreply}</ReactMarkdown>
            </div>
          </div>
        }

      </div>
    </>
  )
}

export default Chat;