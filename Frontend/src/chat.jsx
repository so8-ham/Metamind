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

    const content = reply.split("");

    let idx = 0;
    const interval = setInterval(() => {
      setlatestReply(content.slice(0, idx + 1).join(" "));

      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 40)

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
                    <p className="userMessage">{Chat.content}</p> :
                    <ReactMarkdown rehypePlugins={rehypeHighlight}>{Chat.content}</ReactMarkdown>
                }
              </div>
            )
          })
        }
        {
          latestreply != null &&
          <div className="gptDiv" key={"typing"}>
            <ReactMarkdown rehypePlugins={rehypeHighlight}>{latestreply}</ReactMarkdown>
          </div>
        }

      </div>
    </>
  )
}

export default Chat;