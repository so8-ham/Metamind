import "./sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { AuthContext } from "./AuthContext";
import API_BASE_URL from "./config";
function Sidebar() {
  const { allThreads, setallThreads, currentThreadId, setcurrentThreadId } = useContext(MyContext);
  const { user, logout, token } = useContext(AuthContext);
  const createNewChat = () => {
    setcurrentThreadId(Date.now().toString());
  };
  const getAllThreads = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/thread`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
      setallThreads(filteredData);
      //threadId,title
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getAllThreads();
  }, [currentThreadId]);

  return (
    <>
      <section className="sidebar">
        {/* new chat btn */}
        <button onClick={createNewChat}>
          <img src="src/assets/black.webp" className="logo"></img>
          <span><i className="fa-solid fa-pen-to-square"></i></span>
        </button>
        {/* history */}
        <ul className="history">
          {
            allThreads?.map((thread, idx) => (
              <li
                key={idx}
                onClick={() => setcurrentThreadId(thread.threadId)}
                style={{ cursor: 'pointer', backgroundColor: currentThreadId === thread.threadId ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              >
                {thread.title}
              </li>
            ))
          }
        </ul>
        {/* Sign */}
        <div className="sign">
          <div style={{ marginBottom: '10px', color: '#fff', fontSize: '14px' }}>
            <i className="fa-solid fa-user" style={{ marginRight: '8px' }}></i>
            {user?.name || 'User'}
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              width: '100%'
            }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '6px' }}></i>
            Logout
          </button>
          <p style={{ marginTop: '10px' }}>By Soham &hearts;</p>
        </div>
      </section>
    </>
  )
}

export default Sidebar;
