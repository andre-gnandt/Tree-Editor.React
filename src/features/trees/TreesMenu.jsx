import { useState, useEffect, useRef } from 'react'
import Draggable from 'react-draggable';
import { Dialog } from 'primereact/dialog';
import { Outlet, Link } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import TreeDetails from './TreeDetails';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import '/node_modules/primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../trees/tree.css';
import '../nodes/detailsList.css';

const TreesMenu = () => {
  const firstRender = useRef(true);
  const [requestComplete, setRequestComplete] = useState(false);
  const [createTree, setCreateTree] = useState(null);
  const [search, setSearch] = useState(null);
  const treeList = useRef([]);
  //const [nodeSize, setNodeSize] = useState(200);
  const [list, setList] = useState([...treeList.current]);
  const iconDimension = 0.12*window.innerHeight;
  
  const lines = document.getElementsByClassName('tree-line');
  var i = 0;

  while(i < lines.length)
{
    var line = lines[i];
    line.remove();
    i++;
  }
/*
  function GetNodeSize()
  {
    const widthToHeight = 0.7;
    const maximumWidth = window.innerWidth/7;
    const maximumHeight = window.innerHeight/5.5;

    if(maximumHeight < )
  }*/

  async function GetTreeList(){
    await fetch("http://localhost:11727/api/Trees").then(res => res.json()).then(
        result => { 
          var trees = result;
          setRequestComplete(true);
          treeList.current = trees;
          setList(trees);
        }
    );   
  };

  async function waitForTreeList()
  {
    await GetTreeList();
  }

  if(firstRender.current)
  {
    firstRender.current = false;
    waitForTreeList();
  }

  function CompareTrees(a, b)
  {
    if(a.name > b.name) return 1;
    if(a.name < b.name) return -1;

    return 0;
  }

  function reRenderList(callback = null, newTree = null)
  {
    if(callback === "create")
    {
        treeList.current.push(newTree);
    }

    treeList.current.sort(CompareTrees);
    setSearch(null);
    setList([...treeList.current]); //sort as well
  }

  const EmptyListJSX = () => 
  {
    const windowWidth = window.innerWidth;
    const maximumNodeSize = window.innerHeight*0.5;

    return (
      <>
            <div style = {{position: 'absolute', left: String(windowWidth/2-(maximumNodeSize/2))+'px', top: String(maximumNodeSize/4)+'px', height: String(maximumNodeSize)+'px', width: String(maximumNodeSize)+'px'}}>
              <button onClick={(event) => {document.getElementById('create-root-button').click();}} className='button-root-empty' style = {{padding: '0 0 0 0', backgroundColor: 'lightGrey', color: '#d68a16'}}>
                  <i className='pi pi-warehouse' style = {{fontSize: String(maximumNodeSize)+'px'}} onClick = {() => { setCreateNode(true);}} />
              </button> 
            </div >
              <span style = {{fontSize: '5vh', color: '#d68a16', position: 'absolute', left: String(windowWidth/2-(maximumNodeSize/2))+'px', top: String((5*maximumNodeSize/4)+20)+'px', width: String(maximumNodeSize)+'px'}}>
                There are no trees, click above to create one!
              </span>
          </>
    );
  }

  const gridItem = (tree) => 
    {   
        return (
            <div className='col-3' key = {tree.id} >
                <Link to={"/tree/"+tree.id}> 
                <button 
                       
                    //onClick={(event) => {ValidateButtonClick(event.target);}} 
                >
                     
                    {tree.name}
                </button> 
                </Link> 
            </div>
        );
    }

  const listTemplate = (trees) => {
    return <div className='grid grid-nogutter'>{trees.map((tree) => gridItem(tree))}</div>;
  };

  const closeDialog = () => 
    {
        setCreateTree(false);
    }

  return (
    <>
      <div id = 'button-container' style ={{height: '16vh', position: 'fixed', backgroundColor: 'silver', zIndex: 100}}>
        <div id = 'button-container-inner' style = {{position: 'sticky', display:'flex', top: '0px', width: '100vw', height: '12vh'}}>
          <div id = 'create-container' style = {{height: '100%', display:'flex', width: String((iconDimension))+"px"}}>
            <button className = 'button-header button-create tooltip'>
                <i className='pi pi-upload' style = {{fontSize: '11vh'}} onClick = {() => { setCreateTree(true);}} />
                <span class="tooltip-right">New Tree</span>
            </button>
          </div>
        </div>
      </div>
      <div id = 'content-container' className='card' style = {{position: 'relative', top: '16vh', height: '84vh', width: '100vw'}}>
      {  
        (requestComplete) && 
        (
          <>
            <DataView rows={4} value = {list} listTemplate={listTemplate} layout = {"grid"} />
          </>
        )
      }
      </div>
      <Draggable  onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
        <Dialog className={"dialogContent"} onHide = {() => {setCreateTree(false);}} visible = {createTree} draggable showHeader = {false}  contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '1vw solid #274df5', borderRadius: '5vw', backgroundColor: '#E0E0E0'}}>
              <TreeDetails 
                  inputTree={{name: null, description: null}}
                  creation = {true}
                  unMount={closeDialog}
                  reRenderList={reRenderList}
              />
        </Dialog>
      </Draggable>
    </>
  );
}

export default TreesMenu
