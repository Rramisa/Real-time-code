import React, {useState} from 'react'
import {v4 as uuidV4} from 'uuid';
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const navigate = useNavigate();
  const [roomId,setRoomId] = useState();
  const [username, setUsername] = useState('');
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room")
  };
  const joinRoom = () => {
    if(!roomId || !username){
      toast.error("Room ID and username not found")
    return;  
    }  
    //
    navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
  }
  const handleinput = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };
  return <div className="homePageWrapper">
    <div className="formWrapper">
      <img className="homepageLogo" src='code-sync.png' width={150} height={150} alt="code-sync-logo"/>
      <h4 className="mainLabel">Paste Join code</h4>
      <div className="inputGroup">
        <input type="text" className="inputBox" placeholder="Room Code" onChange={(e) => setRoomId(e.target.value)} value={roomId} onKeyUp={handleinput}/>
        <input type="text" className="inputBox" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} onKeyUp={handleinput}/>
        <button className="btn joinBtn" onClick={joinRoom}>Join</button>
        <span className="createInfo">
           Create &nbsp; 
          <a onClick={createNewRoom} href=" " className="createNewBtn">
            New Room
          </a>
        </span>
      </div>
    </div>
    <footer>
      <h4>
        Built by Ramisa
      </h4>
    </footer>
  </div>;
  
};

export default Home;
