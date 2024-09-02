import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [level, setLevel] = useState(0)
  const [Nodes, setNodes] = useState([]);
  //let NodeData = [];

  
  function getNodes(){
    
    fetch("http://localhost:11727/api/Nodes").then(res=> res.json()).then(
      result => {
        setNodes(result);
      }
    )
    console.log(Nodes);
    
  };
  

  function buttonResults(value){
    console.log("button clicked!");
    setLevel(value);
    getNodes();
  }

  
  return (
    <>
      <div>
        <div className="card">
          <button onClick={(l) => buttonResults(level+1)}>
            level is {level}
          </button>
        </div>
        <h2>Node List........</h2>
        <table>
          <thead>
            <tr>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {
              Nodes.map((node) => (
                <tr key={node.id}>
                  <td>{node.level}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>      
    </>
  )
}

export default App
