import React,{useState} from 'react'
import Client from '../components/Client'
import Editor from '../components/editor';

const Editorpage = () => {
  const [clients,setClients] = useState([{socketID: 1,username: "Ramisa"},{socketID: 2,username: "Kasfa"},{socketID: 3,username: "Nafisa"}

  ]);
 return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            width={150} height={150}
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className='clientsList'>
                      {
                        clients.map((client) => (
                        <Client 
                          key={client.socketID} 
                          username={client.username} 
                        />
                      ))}
                  </div>
            </div>
            <button className='btn copyBtn'>
              Copy Room Code
            </button>
            <button className='btn leaveBtn'>
              Leave Room
            </button>
            </div>
            <div className="editorWrap">
              <Editor />
            </div>
        </div>
    );
};

export default Editorpage;
