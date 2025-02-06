import { useState, useEffect, useCallback} from 'react'
import { useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { DataView} from 'primereact/dataview';
import HeaderInfo from '../utils/HeaderInfo';
import TreeDialog from './TreeDialog';
import { deleteTree } from '../../api/trees/treesApi';
import { GetConfirmDelete } from '../utils/Functions';
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
  const iconDimension = 3.2; //rem

  const closeDialog = useCallback(() => 
    {
        setCreateTree(false);
    }, []);

  const reRenderList = useCallback((callback = null, newTree = null) =>
  {
    if(callback === "create")
    {
        treeList.push(newTree);
    }

    treeList.sort(CompareTrees);
    setTreeList([...treeList]);
  }, [treeList]);

  useEffect(() => {
      window.addEventListener('resize', isPortrait);
      return () => window.removeEventListener('resize', isPortrait);
    });
  

  function FitFontSize(maxSize, maxWidth, text)
  {
    let maxLength = 26;
    let length = text.length <= maxLength ? text.length : maxLength;
    let size = maxWidth/length;
    let fit = size <= maxSize ? size : maxSize;

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
    let index = treeList.findIndex((object) => object.id === deleteOptions);
    treeList.splice(index, 1);
    setTreeList([...treeList]);
    setDeleteOptions(null);
  }

  function FilterTree()
  {
    if(!search || !treeList || treeList.length == 0 || search.length == 0) return treeList;

    return treeList.filter((tree) => { return (tree.name.toLowerCase().includes(search.toLowerCase()))});
  }

  const EmptyListJSX = () => 
    {
      const maximumNodeSize = 50; 
  
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
              <div className='vertical-center' style = {{height: '14px'}}>
                <i className='pi pi-times menu-item-icon' onClick={() => {setDeleteOptions(tree.id)}}/> 
              </div> 
                <div>
                <button 
                    className='menu-button'
                    style = {{fontSize: portrait ? FitFontSize(18, 70, tree.name) : FitFontSize(10, 35, tree.name), 
                              height: portrait ? '23.19vw' : '11.9vw',
                              width: portrait ? '38vw' : '19.5vw',
                              marginLeft: portrait ? '1vw' : '0.5vw'
                            }} //width: 82vw;
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
    return <div className='grid grid-nogutter data-table'>{trees.map((tree) => gridItem(tree))}</div>;
  };

  return (
    <>
        <HeaderInfo fixed = {false}/>
        <div id = 'button-container' className='button-container' style = {{position: 'relative', height: String(iconDimension)+"rem"}}>
          <div id = 'button-container-inner' className = 'button-container-inner'>
            <div id = 'create-container' className='create-container' style = {{width: String(iconDimension)+"rem"}}>
                <button className = 'button-header button-create tooltip'>
                    <i id = 'create-tree-button' className='pi pi-upload' style = {{fontSize: String(iconDimension)+"rem"}} onClick = {() => { setCreateTree(true);}} />
                    <span className="tooltip-right">New Tree</span>
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
                <DataView 
                  paginatorClassName='menu-paginator'
                  paginatorTemplate={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }}
                  paginator  
                  rows = {16} 
                  value = {FilterTree(treeList)}
                   listTemplate={listTemplate} 
                   layout = {"grid"} 
                />
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
        <TreeDialog 
          setCreateTree = {setCreateTree} 
          createTree = {true} 
          portrait = {portrait} 
          inputTree = {{name: null, description: null}} 
          openDialog = {createTree} 
          closeDialog = {closeDialog} 
          reRenderList = {reRenderList}
        />
        {GetConfirmDelete("tree", setDeleteOptions, null, HandleDeleteTree, null, setDeleteOptions, null, deleteOptions)}
    </>  
  );
}

export default TreesMenu
