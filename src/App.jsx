import { useState, useEffect } from 'react'
import NodeDetails   from './Components/NodeDetails'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [level, setLevel] = useState(0)
  const [Nodes, setNodes] = useState({});
  //let NodeData = [];
  
  function getNodes(){
    fetch("http://localhost:11727/api/Nodes/961d76a6-77cd-46c8-9e22-4fc9ab394bdc").then(res=> res.json()).then(
      result => {
        setNodes(result);
      }
    )
  };

  function buttonResults(value){
    console.log("button clicked!");
    //setLevel(value);
    getNodes();
  };

  useEffect(() => {
    getNodes();
  }, [level])
  
  
  return (
    <>
      <div>
        <div className="card">
          <button onClick={(l) => buttonResults(level+1)}>
            level is {level}
          </button>
        </div>
        <h2>Node:</h2>
        <NodeDetails node = {Nodes} />
      </div>      
    </>
  )
}

export default App
