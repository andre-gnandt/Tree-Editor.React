import { useState, useEffect} from 'react'
import Draggable from 'react-draggable';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from "react-router-dom";
import TreeDetails from './TreeDetails';
import { InputText } from 'primereact/inputtext';
import { DataView} from 'primereact/dataview';
import HeaderInfo from '../utils/HeaderInfo';
import { deleteTree } from '../../api/trees/treesApi';
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
  const [mobile, setMobile] = useState(window.innerHeight > 0.85 * window.innerWidth ? true : false);
  const iconDimension = 0.16*window.innerHeight;

  
  useEffect(() => {
      window.addEventListener('resize', isMobile);
      return () => window.removeEventListener('resize', isMobile);
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

  function isMobile()
  {
    if(window.innerHeight > 0.85 * window.innerWidth)
    {
       setMobile(true);
    }
    else
    {
      setMobile(false);
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

        return (
          <div className= {mobile ? 'col-6' : 'col-3'} key = {tree.id} >
              <i className='pi pi-times' onClick={() => {setDeleteOptions(tree.id)}} style = {{cursor: 'pointer', zIndex: 20, top: '2vh', position: 'relative', height: '14px', width: '14px', fontSize: '14px'}}/>
              {/*<Link to={{ pathname: '/tree/'+tree.id, state: 'flushDeal' }}>*/}     
                <button 
                    className='menu-button tree-menu-item'
                    style = {{fontSize: mobile ? FitFontSize(18, 70, tree.name) : FitFontSize(10, 35, tree.name), marginTop:'2vh', padding: '0 0 0 0', backgroundColor: '#DCDCDC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', height: mobile ? '23.19vw' : '11.9vw', width: mobile ? '38vw' : '19.5vw'}}
                    onClick={(event) => {navigate('/tree/'+tree.id);}} 
                >
                    {tree.name}
                    
                </button>
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
      <div>
        <div id = 'button-container' style ={{position: 'fixed', backgroundColor: 'silver', zIndex: 100}}>
          <HeaderInfo/>
          <div id = 'button-container-inner' style = {{position: 'relative', display:'flex', top: '0px', width: '100vw', height: '16vh'}}>
            <div id = 'create-container' style = {{height: '100%', display:'flex', width: String((iconDimension))+"px"}}>
                <button className = 'button-header button-create tooltip'>
                    <i id = 'create-tree-button' className='pi pi-upload' style = {{fontSize: '14vh'}} onClick = {() => { setCreateTree(true);}} />
                    <span class="tooltip-right">New Tree</span>
                </button>
            </div>
            <div className='tree-menu-header' style = {{ left: '0vw', textAlign: 'center', fontSize: '12.5vh', height: '16vh', position: 'relative', width: 'calc(100vw - 32vh)'}}>
                    Trees
            </div>
          </div>
        </div>
        <div id = 'content-container' style = {{position: 'absolute', top: 'calc(22vh + 4vw)', height: 'calc(66vh - 4vw)', width: '82vw', left: '9vw'}}>
        {  
            (treeList != null && treeList.length > 0) ? 
            (
            <>
                <InputText placeholder='Search...' style = {{position: 'relative', left: mobile ? '0vw' : '20.5vw', marginBottom: '3.7vh', height: '8vh', width: mobile ? '80vw' : '40vw', borderRadius: '4vh', fontSize: '5vh'}} onChange={(event) => {setSearch(event.target.value);}} value = {search ? search : ""}/>
                <DataView className='data-table' style = {{scrollbarColor: 'blue',height: 'calc(62vh - 4vw)', maxHeight: 'calc(62vh - 4vw)'}} rows={4} value = {FilterTree(treeList)} listTemplate={listTemplate} layout = {"grid"} />
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
      </div>
        <Draggable  onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>
            <Dialog style = {{width: mobile ? '88vw' : String(0.45*screen.width)+"px", height: mobile ? '73.9vw' : '86vh', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px'}} className={"dialogContent2"} onHide = {() => {setCreateTree(false);}} visible = {createTree} draggable showHeader = {false}  contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}}>
                <TreeDetails 
                    mobile = {mobile}
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
