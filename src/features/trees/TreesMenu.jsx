import { useState, useEffect} from 'react'
import Draggable from 'react-draggable';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from "react-router-dom";
import TreeDetails from './TreeDetails';
import { InputText } from 'primereact/inputtext';
import { DataView} from 'primereact/dataview';
import HeaderInfo from '../utils/HeaderInfo';
import { deleteTree } from '../../api/trees/treesApi';
import { GetDialogHeight, GetDialogWidth, IsDesktop } from '../utils/UtilityFunctions';
import '/node_modules/primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../trees/tree.css';
import '../nodes/DetailsList.css';

const TreesMenu = ({trees}) => {
  const navigate = useNavigate();
  const [createTree, setCreateTree] = useState(null);
  const [search, setSearch] = useState(null);
  const [deleteOptions, setDeleteOptions] = useState(null);
  const [treeList, setTreeList] = useState(trees);
  const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth ? true : false);
  const iconDimension = 5;//0.16*window.innerHeight;

  useEffect(() => {
      window.addEventListener('resize', isPortrait);
      return () => window.removeEventListener('resize', isPortrait);
    });
  

  function FitFontSize(maxSize, maxWidth, text)
  {
    var maxLength = 26;
    var length = text.length <= maxLength ? text.length : maxLength;
    var size = maxWidth/length;
    var fit = size <= maxSize ? size : maxSize;

    return String(fit)+"vw";

  }

  function CompareTrees(a, b)
  {
    if(a.name > b.name) return 1;
    if(a.name < b.name) return -1;

    return 0;
  }

  function isPortrait()
  {
    if(window.innerHeight > window.innerWidth)
    {
       setPortrait(true);
    }
    else
    {
      setPortrait(false);
    }
  }

  async function HandleDeleteTree()
  {
    await deleteTree(deleteOptions);
    var index = treeList.findIndex((object) => object.id === deleteOptions);
    treeList.splice(index, 1);
    setTreeList([...treeList]);
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
    if(!search || !treeList || treeList.length == 0 || search.length == 0) return treeList;

    return treeList.filter((tree) => { return (tree.name.toLowerCase().includes(search.toLowerCase()))});
  }

  function reRenderList(callback = null, newTree = null)
  {
    if(callback === "create")
    {
        treeList.push(newTree);
    }

    treeList.sort(CompareTrees);
    setTreeList([...treeList]);
  }

  const EmptyListJSX = () => 
    {
      const maximumNodeSize = 50; //50vh
  
      return (
        <>
          <div>
              <div className='empty-list-container' style = {{height: String(maximumNodeSize)+'vh', width: String(maximumNodeSize)+'vh'}}>
                <button onClick={(event) => {document.getElementById('create-tree-button').click();}} className='button-list-empty'>
                    <i className='pi pi-upload' style = {{fontSize: String(maximumNodeSize)+'vh'}} onClick = {() => { setCreateTree(true);}} />
                </button> 
              </div >

                <div className='empty-list-message' style = {{width: String(maximumNodeSize)+'vh'}}>
                  There are no trees, click above to create one!
                </div>
            
          </div>
      </>
      );
    }

  const gridItem = (tree) => 
    {   

        return (
          <div className= {portrait ? 'col-6' : 'col-3'} key = {tree.id} >
              {/*<Link to={{ pathname: '/tree/'+tree.id, state: 'flushDeal' }}>*/}   
              <div>
              <i className='pi pi-times menu-item-icon' onClick={() => {setDeleteOptions(tree.id)}}/> 
              </div> 
                <div>
                <button 
                    className='menu-button tree-menu-item'
                    style = {{fontSize: portrait ? FitFontSize(18, 70, tree.name) : FitFontSize(10, 35, tree.name), 
                              height: portrait ? '23.19vw' : '11.9vw',
                              width: portrait ? '38vw' : '19.5vw'
                            }}
                    onClick={(event) => {navigate('/tree/'+tree.id);}} 
                >
                    {tree.name}
                </button>
                </div>
              {/*</Link>*/}
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
        <HeaderInfo fixed = {false}/>
        <div id = 'button-container' className='button-container' style = {{position: 'relative', height: String(iconDimension)+"rem"}}>
          <div id = 'button-container-inner' className = 'button-container-inner'>
            <div id = 'create-container' className='create-container' style = {{width: String(iconDimension)+"rem"}}>
                <button className = 'button-header button-create tooltip'>
                    <i id = 'create-tree-button' className='pi pi-upload' style = {{fontSize: String(iconDimension)+"rem"}} onClick = {() => { setCreateTree(true);}} />
                    <span class="tooltip-right">New Tree</span>
                </button>
            </div>
            <div className='tree-menu-header center-text'>
                    Trees
            </div>
          </div>
        </div>
        <div id = 'content-container' className='menu-content-container'>
        {  
            (treeList != null && treeList.length > 0) ? 
            (
            <>
                <InputText placeholder='Search...' className='search-bar' style = {{left: portrait ? '0vw' : '20.5vw', width: portrait ? '80vw' : '40vw'}} onChange={(event) => {setSearch(event.target.value);}} value = {search ? search : ""}/>
                <DataView className='data-table' rows={4} value = {FilterTree(treeList)} listTemplate={listTemplate} layout = {"grid"} />
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
            <Dialog 
            resizable = {false}
              style = {{maxHeight: '100vh', maxWidth: '100vw', width: GetDialogWidth(portrait), height: GetDialogHeight(portrait), borderRadius: portrait ? '5vw' : String(0.05*screen.width)+'px'}} 
              className={"dialogContent2"} 
              onHide = {() => {setCreateTree(false);}} 
              visible = {createTree} 
              draggable 
              showHeader = {false}  
              contentStyle={{maxHeight: '100vh', maxWidth: '100vw', width: GetDialogWidth(portrait), overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: portrait ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}}
            >
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
  );
}

export default TreesMenu
