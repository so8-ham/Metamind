import './App.css'
import Sidebar from "./sidebar.jsx";
import ChatWindow from "./chatWindow.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import { MyContext } from './MyContext.jsx';
import { AuthContext, AuthProvider } from './AuthContext.jsx';
import { useState, useContext } from 'react';
import { v1 as uuidv1 } from "uuid";

function AppContent() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currentThreadId, setcurrentThreadId] = useState(uuidv1());
  const [prevchats, setprevChats] = useState([]); //store all chats in current threads
  const [newchat, setnewChat] = useState(true);
  const [allThreads, setallThreads] = useState([]);
  const [showSignup, setShowSignup] = useState(false);

  const { isAuthenticated, loading } = useContext(AuthContext);

  const providerValue = {
    prompt, setPrompt,
    reply, setReply,
    currentThreadId, setcurrentThreadId,
    newchat, setnewChat,
    prevchats, setprevChats,
    allThreads, setallThreads
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return showSignup ?
      <Signup onSwitchToLogin={() => setShowSignup(false)} /> :
      <Login onSwitchToSignup={() => setShowSignup(true)} />;
  }

  return (
    <div className="main">
      <MyContext.Provider value={providerValue}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
