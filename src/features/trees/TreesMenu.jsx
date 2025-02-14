import { useState, useEffect, useCallback, useRef} from 'react'
import { useNavigate } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { DataView} from 'primereact/dataview';
import HeaderInfo from '../utils/HeaderInfo';
import TreeDialog from './TreeDialog';
import { deleteTree } from '../../api/trees/treesApi';
import { GetConfirmDelete } from '../utils/Functions';
import { GetTreeList } from '../../api/trees/treesApi';
import '/node_modules/primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../trees/tree.css';
import '../nodes/DetailsList.css';

const TreesMenu = ({trees, maxCount = 1000, itemsPerPage = 20}) => {
  const navigate = useNavigate();
  const currentPage = useRef(1);
  const skipCount = useRef(0);
  const [firstRecord, setFirstRecord] = useState(0);
  const [createTree, setCreateTree] = useState(null);
  const [search, setSearch] = useState(null);
  const [deleteOptions, setDeleteOptions] = useState(null);
  const [treesPaged, setTreesPaged] = useState(structuredClone(trees));
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
      treesPaged.trees.push(newTree);
      trees.trees.push({...newTree});
      trees.count++;
    }

    treesPaged.trees.sort(CompareTrees);
    trees.trees.sort(CompareTrees);

    if(search == null || search.length === 0 || (newTree.name.toLowerCase().includes(search?.toLowerCase()) || newTree.description?.toLowerCase().includes(search?.toLowerCase())))
    {
      treesPaged.searchCount++;
    }

    setTreesPaged({count: treesPaged.count+1, searchCount: treesPaged.searchCount, trees: treesPaged.trees});
  }, [treesPaged]);

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
    let index = treesPaged.trees.findIndex((object) => object.id === deleteOptions);
    treesPaged.trees.splice(index, 1);

    index = trees.trees.findIndex((object) => object.id === deleteOptions);
    const oldTree = trees.trees[index];
    trees.trees.splice(index, 1);
    trees.count--;

    if(search == null || search.length === 0 || (oldTree.name.toLowerCase().includes(search.toLowerCase()) || oldTree.description?.toLowerCase().includes(search.toLowerCase())))
    {
      treesPaged.searchCount--;
    }

    if((currentPage.current-1)*itemsPerPage+1 > treesPaged.searchCount)
    {
      currentPage.current = 1;
      setFirstRecord(0);
    }

    setTreesPaged({count: treesPaged.count-1, searchCount: treesPaged.searchCount, trees: treesPaged.trees});
    setDeleteOptions(null);
  }

  function FilterTree(search)
  {
    if(!search || search.length == 0 || !trees || !trees.trees || trees.trees.length === 0 )
    {
      skipCount.current = 0;
      setTreesPaged({trees: [...trees.trees], count: trees.count, searchCount: trees.count});
    }
    else
    {
      treesPaged.trees = trees.trees.filter((tree) => { 
        return (tree.name.toLowerCase().includes(search.toLowerCase()) || tree.description?.toLowerCase().includes(search.toLowerCase()))
      });
      setTreesPaged({searchCount: treesPaged.trees.length, trees: treesPaged.trees, count: trees.count});
    }
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
    return  <>
              <div className='data-table-outline'>
                <div className='grid grid-nogutter data-table'>{trees.map((tree) => gridItem(tree))}</div>
              </div>
            </>;
  };

  async function CallSearchApi(search)
  {
    skipCount.current = 0;
    const getList = await GetTreeList(maxCount, skipCount.current, search);
    setTreesPaged({count: getList.count, searchCount: getList.searchCount,  trees: getList.trees});
  }

  async function GetMoreTrees()
  {
    const getList = await GetTreeList(maxCount, skipCount.current, search);
    treesPaged.trees = treesPaged.trees.concat(getList.trees);
    if(search == null || search.length === 0) trees.trees = trees.trees.concat([...getList.trees]);

    setTreesPaged({count: treesPaged.count, searchCount: getList.searchCount,  trees: treesPaged.trees});
  }

  async function Paginate(event)
  {
    const prevPage = currentPage.current;
    const nextPage = event.page+1;
    currentPage.current = nextPage;
    const pageMax = Math.ceil(treesPaged.trees.length/itemsPerPage);
    //const pageMin = pageMax-maxCount/itemsPerPage+1;

      console.log("next page "+nextPage);
      console.log("prev page "+currentPage.current);
      console.log("page max "+pageMax);
      //console.log("page min "+pageMin);
      console.log("skip count "+skipCount.current);

    if(nextPage === pageMax+1 && prevPage === pageMax)
    {
      skipCount.current = skipCount.current+maxCount;
      await GetMoreTrees();
    }
    /*
    else if(nextPage === pageMin-1 && prevPage === pageMin)
    {
      skipCount.current = skipCount.current-maxCount;
      await GetMoreTrees();
    }
    */

    setFirstRecord((nextPage-1)*itemsPerPage);
    console.log("skip count after"+skipCount.current);
  }

  async function SearchTable(string)
  {
    currentPage.current = 1;
    if(trees.trees.length >= trees.count || string == null || string.length === 0)
    {
      FilterTree(string);
    }
    else 
    {
      await CallSearchApi(string);
    }

    setSearch(string);
    setFirstRecord(0);
  }

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
            (trees.count > 0) ? 
            (
            <>
                <InputText placeholder='Search...' className='search-bar' style = {{left: portrait ? '0vw' : '20.5vw', width: portrait ? '80vw' : '40vw'}} onChange={(event) => {SearchTable(event.target.value);}} value = {search ? search : ""}/>
                <DataView 
                  paginatorClassName='menu-paginator'
                  paginatorTemplate={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }}
                  totalRecords={treesPaged.searchCount}
                  onPage={(event) => {Paginate(event)}}
                  first={firstRecord}
                  paginator  
                  rows = {itemsPerPage} 
                  value = {treesPaged.trees}
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
