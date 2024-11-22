import { useState, useEffect, useRef } from 'react'
import Draggable from 'react-draggable';
import { Dialog } from 'primereact/dialog';
import { Outlet, Link } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import TreeDetails from './TreeDetails';
import { InputText } from 'primereact/inputtext';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import history from '../../history';
import '/node_modules/primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../trees/tree.css';
import '../nodes/detailsList.css';

const TreesMenu = ({trees}) => {
  const [createTree, setCreateTree] = useState(null);
  const [search, setSearch] = useState(null);
  const [deleteOptions, setDeleteOptions] = useState(null);
  const treeList = useRef([...trees]); 
  const [list, setList] = useState([...treeList.current]);
  const iconDimension = 0.16*window.innerHeight;

  /*
  function GetNodeSize()
  {
    const widthToHeight = 0.7;
    const maximumWidth = window.innerWidth/7;
    const maximumHeight = window.innerHeight/5.5;

    if(maximumHeight < )
  }*/

  function CompareTrees(a, b)
  {
    if(a.name > b.name) return 1;
    if(a.name < b.name) return -1;

    return 0;
  }

  async function DeleteTree(id)
  {
    await fetch("http://localhost:11727/api/Trees/"+id, {method: 'DELETE'})
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
  
   };


  async function HandleDeleteTree()
  {
    await DeleteTree(deleteOptions);
    var index = treeList.current.findIndex((object) => object.id === deleteOptions);
    treeList.current.splice(index, 1);
    setList([...treeList.current]);
    setDeleteOptions(null);
  }

  const GetConfirmDelete = () =>
    {
        return (
        <>  <Draggable>
                <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}}  visible = {deleteOptions} onHide = {() => {setDeleteOptions("")}}>
                    <>  
                    <i onClick={() => {setDeleteOptions(null)}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                        <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                            <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>Please confirm that you would like to delete this Tree.</div>
                            <div style = {{position: 'relative', top: '10vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button className='text-overflow button' onClick={() => {HandleDeleteTree();}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Yes</button>
                                </div>
                                <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                    <button 
                                         onClick={() => {setDeleteOptions(null); }}
                                         className='button text-overflow' style = {{height: '12vh',  width: '15.5vw', fontSize: '4vh'}}>No</button>
                                </div>
                            </div>
                        </div>
                    </>
                </Dialog>
            </Draggable>
        </>
        );
    }

  function FilterTree()
  {
    if(!search || !list || list.length == 0 || search.length == 0) return list;

    return list.filter((tree) => { return (tree.name.toLowerCase().includes(search.toLowerCase()))});
  }

  function reRenderList(callback = null, newTree = null)
  {
    if(callback === "create")
    {
        treeList.current.push(newTree);
    }

    treeList.current.sort(CompareTrees);
    setList([...treeList.current]);
  }

  const EmptyListJSX = () => 
    {
      const maximumNodeSize = 50; //50vh
  
      return (
        <>
          <div>
              <div style = {{marginLeft: 'auto', marginRight: 'auto', height: String(maximumNodeSize)+'vh', width: String(maximumNodeSize)+'vh'}}>
                <button onClick={(event) => {document.getElementById('create-tree-button').click();}} className='button-root-empty' style = {{padding: '0 0 0 0', backgroundColor: 'lightGrey', color: '#0cdc16'}}>
                    <i className='pi pi-upload' style = {{fontSize: String(maximumNodeSize)+'vh'}} onClick = {() => { setCreateTree(true);}} />
                </button> 
              </div >

                <div style = {{marginLeft: 'auto', marginRight: 'auto', fontSize: '5vh', color: '#0cdc16',  width: String(maximumNodeSize)+'vh'}}>
                  There are no trees, click above to create one!
                </div>
            
          </div>
      </>
      );
    }

  const gridItem = (tree) => 
    {   
        //container: 82vw 57vh
        //columns: 3, rows: 2
        return (
            <div className='col-3' key = {tree.id} >
                <i className='pi pi-times' onClick={() => {setDeleteOptions(tree.id)}} style = {{cursor: 'pointer', zIndex: 20, top: '2vh', position: 'relative', height: '14px', width: '14px', fontSize: '14px'}}/>
                <Link to={"/tree/"+tree.id}> 
                
                <button 
                    className='menu-button'
                    style = {{fontSize: '3.25vw', marginTop:'2vh', padding: '0 0 0 0', backgroundColor: '#DCDCDC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', height: '27vh', width: '19.5vw'}}
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
        <>
        <div id = 'button-container' style ={{height: '16vh', position: 'fixed', backgroundColor: 'silver', zIndex: 100}}>
            <div id = 'button-container-inner' style = {{position: 'sticky', display:'flex', top: '0px', width: '100vw', height: '16vh'}}>
            <div id = 'create-container' style = {{height: '100%', display:'flex', width: String((iconDimension))+"px"}}>
                <button className = 'button-header button-create tooltip'>
                    <i id = 'create-tree-button' className='pi pi-upload' style = {{fontSize: '14vh'}} onClick = {() => { setCreateTree(true);}} />
                    <span class="tooltip-right">New Tree</span>
                </button>
            </div>
            <div className='text-overflow' style = {{left: '30vw', fontSize: '10vh', height: '16vh', position: 'relative', width: '16vw'}}>
                    Trees
            </div>
            </div>
        </div>
        <div id = 'content-container' style = {{position: 'relative', top: '22vh', height: '70vh', width: '82vw', left: '9vw'}}>
        {  
            (list != null && list.length > 0) ? 
            (
            <>
                <InputText placeholder='Search...' style = {{marginBottom: '5vh', height: '8vh', width: '40vw', borderRadius: '4vh', fontSize: '5vh'}} onChange={(event) => {setSearch(event.target.value);}} value = {search ? search : ""}/>
                <DataView className='data-table' style = {{scrollbarColor: 'blue',height: '59vh', maxHeight: '59vh'}} rows={4} value = {FilterTree(list)} listTemplate={listTemplate} layout = {"grid"} />
            </>
            )
            :
            (
                <>
                    {EmptyListJSX()}
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
        {GetConfirmDelete()}
        </>
        
        
        
    </>
  );
}

export default TreesMenu
