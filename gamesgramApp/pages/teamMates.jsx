import { useRouter } from 'next/router';
import Sidebar from '@/components/Siderbar';
import styles from '@/styles/TeamMates.module.css';
import RecentGame from '@/components/Profile/recentGame';
import ChatBox from '@/components/ChatBox';
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
const TeamMates = ({  }) => { 

    //Data Hooks
    const [Game, setGame] = useState(null);

    //react router variable
    const router = useRouter();
    //fetching steamid from url
    const steamid = router.query.steamid;

      //Constant for the sidebar selection highlight which is passed as a prop to child components
    const SidebarSelect = 
        {home: "nav-link text-white",
        search: "nav-link text-white",
        reels: "nav-link text-white",
        teamMates: "nav-link active",
        profile: "nav-link text-white",
        signout: "nav-link text-white"};

    //get the game state from children component => resentGame
    const handleGameSet = (newState) => {
        if (newState) {  // Only update if newState is not null
            setGame(newState);
        }
    };

    const [socketInstance, setSocketInstance] = useState("");
    const [loading, setLoading] = useState(true);
    const [buttonStatus, setButtonStatus] = useState(false);
  
    const handleClick = () => {
      if (buttonStatus === false) {
        setButtonStatus(true);
      } else {
        setButtonStatus(false);
      }
    };
  
    useEffect(() => {
      if (buttonStatus === true) {
        const socket = io("localhost:5001/", {
          transports: ["websocket"],
          cors: {
            origin: "http://localhost:3000/",
          },
        });
  
        setSocketInstance(socket);
  
        socket.on("connect", (data) => {
          console.log(data);
        });
  
        setLoading(false);
  
        socket.on("disconnect", (data) => {
          console.log(data);
        });
  
        return function cleanup() {
          socket.disconnect();
        };
      }
    }, [buttonStatus]);

return (
    <>
    <div className={styles.main}>
        <div className={styles.one}><Sidebar selection={SidebarSelect}/></div>
        <div className={styles.two}>{<RecentGame onGameSet={handleGameSet}  steamid={steamid}/>}</div>
        <div className={styles.two}>{<ChatBox />}</div>

        <div className={styles.two}>{!buttonStatus ? (
        <button onClick={handleClick}>turn chat on</button>
      ) : (
        <>
          <button onClick={handleClick}>turn chat off</button>
          <div className="line">
            {!loading && <WebSocketCall socket={socketInstance} />}
          </div>
        </>
      )}</div>
    </div>
    </>   
)

}

export default TeamMates;


function WebSocketCall({ socket }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
  
    const handleText = (e) => {
      const inputMessage = e.target.value;
      setMessage(inputMessage);
    };

    
  
    const handleSubmit = () => {
      if (!message) {
        return;
      }
      socket.emit("data", message);
      setMessage("");
    };
  
    useEffect(() => {
      socket.on("data", (data) => {
        setMessages([...messages, data.data]);
      });
    }, [socket, messages]);
  
    return (
      <div>
        <h2>WebSocket Communication</h2>
        <input type="text" value={message} onChange={handleText} />
        <button onClick={handleSubmit}>submit</button>
        <ul>
          {messages.map((message, ind) => {
            return <li key={ind}>{message}</li>;
          })}
        </ul>
      </div>
    );
  }