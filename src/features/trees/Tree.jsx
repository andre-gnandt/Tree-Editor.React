import {memo, useCallback, useEffect, useState} from 'react'
import TreeNode from '../nodes/TreeNode';
import { Provider} from 'react-redux';
import { store } from '../../store';
import LineTo from 'react-lineto';
import Draggable from 'react-draggable';
//slider disabled until improvements are made
//import { Slider } from 'primereact/slider';
import { createRoot } from 'react-dom/client';
import CreateNode from '../nodes/CreateNode';
import CreateRoot from '../nodes/CreateRoot';
import EditTree from '../trees/EditTree';
import { useNavigate } from 'react-router-dom';
import HeaderInfo from '../utils/HeaderInfo';
import { updateManyNodes } from '../../api/nodes/nodesApi';
import '../trees/tree.css';
import 'primeicons/primeicons.css';
import { IsDesktop } from '../utils/Functions';

/*extra node properties include:
'position'
'left'
'top'
'line'
'dialog'
'path'
'thumbnailReq'
*/

//Due to strange issues and positioning with the CSS transform 
//property of tree nodes on re renders, this component will NEVER Re render
//Re renders of the tree diagram must be done manually
const Tree = memo(({id, treeFetch, countries = null}) => {
  //slider disabled until improvements are made
  //const [sliderValue, setSliderValue] = useState(50);
  const navigate = useNavigate();
  const treeDetails = treeFetch != null && treeFetch.tree != null ? treeFetch.tree : null;
  let originalTree = treeFetch != null && treeFetch.root != null ? treeFetch.root : null;
  let tree = originalTree != null ? structuredClone(originalTree) : null;
  const pixelsToCentimetres = PixelSizeInCentimetres();
  const horizontalTreeMargin = window.innerWidth/20;
  let maxLevels = new Object();
  let scrollXBefore = 0;
  let scrollYBefore = 0;
  let scrollDistanceX = 0;
  let scrollDistanceY = 0;
  let treeWidth = 0;
  let treeHeight = 0;
  let treeWidthMin = null;
  let treeWidthMax = null;
  let childPositions = new Object();
  let nodeDictionary = new Object();
  let originalDictionary = {...nodeDictionary};
  let changeTracker = new Object();
  let nodeList = [];
  let dragging = false;
  let mouseOverNode = null;
  const minimumNodeSize = IsDesktop() ? 1/pixelsToCentimetres : 0.7/pixelsToCentimetres;
  let nodeDimension = 80;
  let iconDimension = 3.2; //rem;
  let testRender = false;
  let rendering = false;
  let resetting = false;

  useEffect(() => {
    
    if(tree){ 
      RemoveLines(tree); 
      AddLines(tree);
    }
    if(treeDetails)
    {
      document.getElementById('save-tree-positions').disabled = true;
      document.getElementById('revert-tree-positions').disabled = true;
    }
    window.addEventListener('resize', ReRenderOnResize);

    return () =>{ 
      window.removeEventListener('resize', ReRenderOnResize);
      if(tree) RemoveLines(tree);
    }
  });

  function ReRenderOnResize()
  {
    ReRenderTree(false);
  }

  const UnsavedTreePositions =  useCallback(() => 
  {
    return (changeTracker && Object.keys(changeTracker).length > 0);
  }, [treeFetch, countries]);

  const ReRenderTree = useCallback((reRender = false, callback = null, newNode = null, nodeId = null, newParentId = null, oldParentId = null, zoomPercentage = null) =>
  {
    RenderTreeMutex();
    if(rendering || dragging || resetting) return;
    rendering = true;

    const treeContainer = createRoot(document.getElementById('tree-root'));
    if(!tree && !newNode)
    {
       treeContainer.render((RenderTree(true, tree, zoomPercentage)));
       rendering = false;
       return;
    }
    else if(tree)
    {
      
      RemoveLines(tree);
    }

    //iconDimension = 0.08*window.innerHeight;

    nodeList = [];
    nodeDictionary = [];
    let inputTree = tree;
    let node = null;

    //change the trees frontend structure to match the changes that were made in the database (without any api calls)
    //triggered from a saved change of parent node or creation of a new node from the node details dialog (from a POST node or PUT node request)
    if(callback)
    {
      inputTree = structuredClone(tree);
      tree = inputTree;

      if(callback === "update")
      {
        RemoveLine({id: nodeId, nodeId: oldParentId});
        node = AlterTreeStructureForParentNodeChange(inputTree, nodeId, newParentId, oldParentId);

        const originalNode = FindNodeInTree(nodeId, originalTree);
        AlterTreeStructureForParentNodeChange(originalTree, nodeId, newParentId, originalNode.nodeId, originalNode);

        SetNodePropertiesForUpdate(newNode, node);
        SetNodePropertiesForUpdate(newNode, originalNode);
      }
      else if(callback === "create")
      {
        node = AlterTreeStructureForCreateNode(inputTree, newNode);
        AlterTreeStructureForCreateNode(originalTree, {...newNode});
      }
      else if(callback === "new root")
      {
        node = AlterTreeAtructureForCreateRoot(inputTree, newNode);
        inputTree = newNode;
        tree = newNode;

        const copyNewNode = structuredClone(newNode);
        copyNewNode.children = [];
        const originalTreeRoot = AlterTreeAtructureForCreateRoot(originalTree, copyNewNode);
        originalTree = originalTreeRoot;

      }
      else if(callback === "delete single")
      {
        node = AlterTreeStructureForDeleteSingle(inputTree, nodeId, oldParentId);
        originalTree = structuredClone(inputTree);
        /*
        const originalNode = FindNodeInTree(nodeId, originalTree);
        const newParent = FindNodeInTree(oldParentId, originalTree);
        AlterTreeStructureForDeleteCascade(originalTree, nodeId, originalNode.nodeId, originalNode);
        originalNode.children.forEach(child => {
          child.nodeId = oldParentId;
          AddNodeToChildren(newParent, child);
        });   */
      }
      else if(callback === "delete cascade")
      {
        node = AlterTreeStructureForDeleteCascade(inputTree, nodeId, oldParentId);
        originalTree = structuredClone(inputTree);
        /*
        const originalNode = FindNodeInTree(nodeId, originalTree);
        AlterTreeStructureForDeleteCascade(originalTree, nodeId, originalNode.nodeId, originalNode);
        */
      }
    }

    maxLevels = new Object();
    childPositions = new Object();
    nodeDictionary = new Object();
    //RemoveLines(inputTree);
    if(reRender)
    {
      treeContainer.render((RenderTree(reRender, inputTree, zoomPercentage)));
    }
    else 
    {
      RenderTree(reRender, inputTree, zoomPercentage);
    }

    CorrectTransforms(inputTree);
    ResetElementPositions(inputTree);
    AddLines(inputTree);
    RenderCreationButtons();

    //update the change tracker (for drag and drop of subtrees) to remove any changes already saved in the database
    if(callback === "update")
    {
      delete changeTracker[node.id];
      originalDictionary[node.id] = {...nodeDictionary[node.id]};
    }
    else if(callback === "create")
    {
      originalDictionary[node.id] = {...nodeDictionary[node.id]};
    }
    else if(callback === "new root")
    {
      originalDictionary[node.id] = {...nodeDictionary[node.id]};
    }
    else if(callback === "delete single")
    {
      //UpdateChangeTrackerForDeleteSingle(node);
      originalDictionary = structuredClone(nodeDictionary);
    }
    else if(callback === "delete cascade")
    {
      //UpdateChangeTrackerForDeleteCascade(node);
      originalDictionary = structuredClone(nodeDictionary);
    }

    const treeUnsaved = (changeTracker && Object.keys(changeTracker).length > 0);

    document.getElementById('save-tree-positions').disabled = !(treeUnsaved);
    document.getElementById('revert-tree-positions').disabled = !(treeUnsaved);

    RemoveLines(inputTree, true);
    rendering = false;
  }, [treeFetch, countries]);

  const ThumbnailXHRSentCallBack = useCallback((node) =>
  {
    const originalNode = FindNodeInTree(node.id, originalTree);
    originalNode['thumbnailReq'] = true;
  }, [treeFetch, countries]);

  const ThumbnailXHRDoneCallBack = useCallback((node) => 
  {
    ReRenderTreeNodeMutex();
    rendering = true;

    const originalNode = FindNodeInTree(node.id, originalTree);
    originalNode.files = [...node.files];

    const currentNode = FindNodeInTree(node.id, tree);
    currentNode.files = [...node.files]

    rendering = false;
  }, [treeFetch, countries]);

  const UpdateChangeTrackerCallback = useCallback((node) =>
  {
    originalDictionary[node.id] = {...node};
    delete changeTracker[node.id];

    if(Object.keys(changeTracker).length === 0) 
    {
      document.getElementById('save-tree-positions').disabled = true;
      document.getElementById('revert-tree-positions').disabled = true;
    }
  }, [treeFetch, countries]);

  const ReRenderTreeNode = useCallback((node) =>
  {
    ReRenderTreeNodeMutex();
    if(rendering || resetting) return;
    rendering = true;

    createRoot(document.getElementById(node.id)).render
    (
      <Provider store ={store}>
          <TreeNode 
            unsavedTreePositions={UnsavedTreePositions}
            reRenderTreeNode = {ReRenderTreeNode}
            thumbnailXHRSentCallBack = {ThumbnailXHRSentCallBack}
            thumbnailXHRDoneCallBack = {ThumbnailXHRDoneCallBack}
            setChangeTracker = {UpdateChangeTrackerCallback}
            rootNode = {tree} 
            render = {ReRenderTree} 
            inputNode = {node} 
            css = {{nodeSize: nodeDimension}} 
            nodeList = {nodeList} 
            nodeDictionary = {nodeDictionary}
            countries = {countries}
          />
      </Provider> 
    );

    rendering = false;
  }, [UnsavedTreePositions, ReRenderTree, ThumbnailXHRDoneCallBack, ThumbnailXHRSentCallBack, UpdateChangeTrackerCallback, treeFetch, countries]);

  function RenderTreeMutex() {
    if(rendering || dragging || resetting) {
        setTimeout(RenderTreeMutex, 50);
        return;
    }
  }

  function PixelSizeInCentimetres() {
    let cpi = 2.54; // centimeters per inch
    let dpi = 96; // dots per inch
    let ppd = window.devicePixelRatio; // pixels per dot
    return (cpi / (dpi * ppd));
  }

  function SetNodePropertiesForUpdate(src, dest)
  {
    dest.id = src.id;
    dest.title = src.title;
    dest.files = src.files;
    dest.number = src.number;
    dest.data = src.data;
    dest.rankId = src.rankId;
    dest.thumbnailId = src.thumbnailId;
    dest.description = src.description;
    dest.country = src.country;
    dest.region = src.region;
    dest.level = src.level;
    dest.treeId = src.treeId;
  }

  function CompareNodes(a, b)
    {
        if ( a.id < b.id ){                                                                   
            return -1;
          }
          if ( a.id > b.id ){
            return 1;
          }
          return 0;
    }

  function FindNodeInTree(id, tree)
  {
    if(tree.id === id) return tree; 
    let node = null;

    for(let i = 0; i < tree.children.length; i++)
    {     
        node = FindNodeInTree(id, tree.children[i]);
        if(node){ return node; };
    }
    return node;
  } 

  function UpdateChangeTrackerForDeleteCascade(node)
  {
    delete changeTracker[node.id];
    delete originalDictionary[node.id];

    node.children.forEach(child => {
      UpdateChangeTrackerForDeleteCascade(child);
    });
  }

  function  UpdateChangeTrackerForDeleteSingle(node)
  {
    delete changeTracker[node.id];
    delete originalDictionary[node.id];

    node.children.forEach(child => {
      delete changeTracker[child.id];
      originalDictionary[child.id] = {...nodeDictionary[child.id]};
    })
  }

  function ResetElementPositions(node)
  {
    if(node)
    {
      delete node['line'];
      delete node['position'];

      node.children?.forEach(child => {
        ResetElementPositions(child);
      })
    }
  }

  function AddNodeToChildren(parentNode, childNode)
  {
    parentNode.children.push(childNode);
    parentNode.children.sort(CompareNodes);
  }

  function RemoveChildFromNode(oldParentNode, childId)
  {
      const removeOldChildIndex = oldParentNode.children.findIndex((object) => object.id === childId);
      if(removeOldChildIndex > -1)  oldParentNode.children.splice(removeOldChildIndex, 1);
      oldParentNode.children.sort(CompareNodes);
  }

  function AlterTreeStructureForDeleteCascade(tree, nodeId, parentNodeId, node = null, parentNode = null)
  {
    if(!parentNode) parentNode = FindNodeInTree(parentNodeId, tree);
    if(!node) node = FindNodeInTree(nodeId, tree);
    
    RemoveChildFromNode(parentNode, nodeId);
    node.nodeId = null;

    return node;
  }

  function AlterTreeStructureForDeleteSingle(tree, nodeId, parentNodeId, node = null, parentNode = null)
  {
    if(!parentNode) parentNode = FindNodeInTree(parentNodeId, tree);
    if(!node) node = FindNodeInTree(nodeId, tree);
    
    RemoveChildFromNode(parentNode, nodeId);
    node.nodeId = null;
    
    node.children.forEach(child => {
      child.nodeId = parentNodeId;
      AddNodeToChildren(parentNode, child);
    });   
    return node; 
  }

  /*
  function AlterTreeStructureForNodeChangedToRoot(tree, nodeId, oldParentNodeId, node = null, oldParentNode = null)
  {
    if(!node) node = FindNodeInTree(nodeId, tree);
    if(!oldParentNode) oldParentNode = FindNodeInTree(oldParentNodeId, tree);

    RemoveChildFromNode(oldParentNode, node.id);
    const oldRootNode = tree;
    AddNodeToChildren(node, oldRootNode);
    oldRootNode.nodeId = node.id;
  }
  */

  function AlterTreeAtructureForCreateRoot(tree, newNode)
  {
    if(tree != null && ('id' in tree))
    {
      const oldRootNode = tree;
      AddNodeToChildren(newNode, oldRootNode);
      oldRootNode.nodeId = newNode.id;
    }

    return newNode;
  }

  function AlterTreeStructureForCreateNode(tree, newNode, parentNode = null)
  {
    if(!parentNode) parentNode = FindNodeInTree(newNode.nodeId, tree);
    AddNodeToChildren(parentNode, newNode);

    return newNode;
  }

  function AlterTreeStructureForParentNodeChange(tree, nodeId, newParentNodeId, oldParentNodeId, node = null, oldParentNode = null, newParentNode = null)
  {
      if(!node) node = FindNodeInTree(nodeId, tree);

      if(!oldParentNodeId || !newParentNodeId){ return node;}
      if(!oldParentNode) oldParentNode = FindNodeInTree(oldParentNodeId, tree);
      if(!newParentNode) newParentNode = FindNodeInTree(newParentNodeId, tree);
      
      node.nodeId = newParentNodeId;
      RemoveChildFromNode(oldParentNode, node.id);
      AddNodeToChildren(newParentNode, node);
      
      return node;
  }

  function FindMobileDropPosition(tree, nodeId, position)
  {
    if(tree.id === nodeId) return false;

    const dPosition = GetElementPosition(document.getElementById(tree.id));
    const top = position.Y;
    const left = position.X;
    //const dTop = tree['top'];
    //const dLeft = tree['left'];
    const dTop = dPosition.Y;
    const dLeft = dPosition.X;
    const leftBoundary = dLeft-nodeDimension/2;
    const rightBoundary = dLeft+nodeDimension/2;
    const topBoundary = dTop-nodeDimension/2;
    const bottomBoundary = dTop+nodeDimension/2;

    if(top >= topBoundary && top <= bottomBoundary && left <= rightBoundary && left >= leftBoundary)
    {
      mouseOverNode = tree.id;
      return true;
    } 

    let i = 0;
    while(i < tree.children.length)
    {
      let child = tree.children[i];
      let overlap =  FindMobileDropPosition(child, nodeId, position);

      if(overlap) return true;
      i++;
    }

    return false;
  }

  function IsDescendant(node, id)
  {
    if(node.id === id) return true;  
    let i = 0;
    while(i < node.children.length)
    {
      const child  = node.children[i];
      if(IsDescendant(child, id)) return true;
      i++;
    };
    return false;
  }

  function OnDropNode(mouse, node)
  {
    SetZIndices(node, 4, 0, 'auto');
    HideButtons(node, false);
    
    if(!IsDesktop())
    {
       const position = GetElementPosition(document.getElementById(node.id));
       FindMobileDropPosition(tree, node.id, position);
    }
    else if(mouseOverNode && IsDescendant(node, mouseOverNode))
    {
      mouseOverNode = null;
    }
      
    if(mouseOverNode && mouseOverNode !== node.id && mouseOverNode !== node.nodeId)
    {
      const oldParentNode = nodeDictionary[node.nodeId];
      const newParentNode = nodeDictionary[mouseOverNode];   
      AlterTreeStructureForParentNodeChange(tree, node.id, mouseOverNode, node.nodeId, node, oldParentNode, newParentNode);

      //remove collapse button if previous parent no longer contains any children
      if(oldParentNode.children.length === 0 && IsDesktop()) document.getElementById(oldParentNode.id+"-collapse").remove();
      //add new collapse button to new parent node
      if(newParentNode.children.length === 1 && IsDesktop())
      {
        const treeRootElement = document.getElementById('tree-root');
        
        const newParentCollapseButton = document.createElement('button');
        newParentCollapseButton.id = newParentNode.id+"-collapse";
        newParentCollapseButton.className = 'button treenode-action-button';
        newParentCollapseButton.onclick = () => CollapseDescendants(newParentNode);

        const newParentCollapseIcon = document.createElement('i');
        newParentCollapseIcon.id = newParentNode.id+"-collapse-icon";
        newParentCollapseIcon.className = 'pi pi-angle-up treenode-action-icon center-text';

        treeRootElement.appendChild(newParentCollapseButton);
        newParentCollapseButton.appendChild(newParentCollapseIcon);
      }
      
      const originalNode = originalDictionary[node.id];
      if(originalNode.nodeId !== mouseOverNode)
      {
        changeTracker[node.id] = mouseOverNode;
      }
      else
      {
        delete changeTracker[node.id];
      }

      mouseOverNode = null;
      dragging = false;
      ReRenderTree(false);
    }
    else
    {
      ResetSubtree(node);
      AddLine(node);
    } 
    dragging = false;
  }

  function SetZIndices(node, nodeIndex, lineIndex, pointerEvents)
  { 
    const nodeElement = document.getElementById(node.id);
    nodeElement.style.zIndex = nodeIndex;
    nodeElement.style.pointerEvents = pointerEvents;

    const line = document.getElementsByClassName(node.nodeId+"_"+node.id);
      if(line && line.length > 0) line[0].style.zIndex = lineIndex;

    node.children.forEach(child => {
      SetZIndices(child, nodeIndex, lineIndex)
    })
  }

  function AdjustCollapsedNodes(node, hide = false)
  {
    const isCollapsed = hide;
    if('collapse' in node && node.collapse)
    {
      hide = true;
    }

    if(isCollapsed)
    {
      const nodeHTMLElement = document.getElementById(node.id);
      nodeHTMLElement.style.display = 'none';
      nodeHTMLElement.style.visibility = null;

      /*
      const lineElement = document.getElementsByClassName(node.nodeId+"_"+node.id)[0];
      lineElement.style.display = 'none';
      lineElement.style.visibility = null;
      */

      if(node.children.length > 0)
      {
        const collapseButton = document.getElementById(node.id+"-collapse");
        collapseButton.style.display = 'none';
        collapseButton.style.visibility = null;
      }
    }

    node.children.forEach(child => {
      AdjustCollapsedNodes(child, hide);
    });
  }

  function HideButtons(node, hide)
  { 
    if(!IsDesktop()) return;

    if(node.children.length > 0) document.getElementById(node.id+"-collapse").style.display = hide ? 'none' : 'block';
    document.getElementById(node.id+"-create").style.display = hide ? 'none' : 'block';
    if(!('collapse' in node && node.collapse))
    {
      node.children.forEach(child => {HideButtons(child, hide);});
    }
  }

  function StartDrag(node)
  {
    dragging = true;
    //node = FindNodeInTree(node.id, tree);
    SetZIndices(node, 12, 8, 'none');
    HideButtons(node, true);
    RemoveLine(node);
  }

  function RemoveLine(node, extra = false)
  {
    if(node.nodeId)
    {
      const lines = document.getElementsByClassName(node.nodeId+"_"+node.id);
      let i = extra ? 1 : 0;
      while(i < lines.length)
      {
        lines[i].remove();
        i++;
      }
    }
  }

  const NotDraggable = (child) => {
    return child["dialog"] || resetting || rendering || dragging || (!IsDesktop() && child.thumbnailId && child.files.length === 0);
  }

  function Collapse(node, hide)
  {
    node.children.forEach(child => {
      const nodeElement = document.getElementById(child.id);
      const dimension = nodeElement.style.maxWidth;
      nodeElement.style.visibility = "visible";
      nodeElement.style.display = hide ? 'none' : 'block';
      nodeElement.style.width = dimension;
      nodeElement.style.height = dimension;
      nodeElement.style.maxWidth = dimension;
      nodeElement.style.maxHeight = dimension;

      const lineElement = document.getElementsByClassName(child.nodeId+"_"+child.id)[0];
      lineElement.className = hide ? node.id+"_"+child.id+" hidden" : node.id+"_"+child.id;

      const addChildButton = document.getElementById(child.id+"-create");
      addChildButton.style.visibility = "visible";
      addChildButton.style.display = hide ? 'none' : 'block';
      
      if(('children' in child && child.children.length > 0))
      {
        const collapseButtonElement = document.getElementById(child.id+"-collapse");
        collapseButtonElement.style.display = hide ? 'none' : 'block';
        collapseButtonElement.style.visibility = "visible";
      }

      if(!('collapse' in child && child.collapse) || hide)
      {
        Collapse(child, hide);
      }
    });
  }

  function CollapseDescendants(node)
  {
    const hideTree = !('collapse' in node && node.collapse);
    
    const collapseIcon = document.getElementById(node.id+'-collapse-icon');
    if(collapseIcon) collapseIcon.className = hideTree ? 'pi pi-angle-down treenode-action-icon center-text' : 'pi pi-angle-up treenode-action-icon center-text';

    Collapse(node, hideTree);
    node['collapse'] = hideTree;
  }

  function AppendChildNode(tree, child, left, row, nodeSize, verticalOffset, buttonSize, collapsed = false)
  {
    
    return (
      <>
        { (IsDesktop()) && 
          (
            <>
              { (('children' in child && child.children.length > 0)) && (
                <button className='treenode-action-button button center-text' id={child.id+"-collapse"}
                  style = {{height: String(buttonSize)+'px', width: String(buttonSize)+'px', 
                    maxHeight: String(buttonSize)+'px', maxWidth: String(buttonSize)+'px', 
                    left: String(left-buttonSize)+'px', top: String((row*nodeSize*1.5)+verticalOffset+(nodeSize-buttonSize))+'px',
                    borderRadius: String(buttonSize*0.2)+'px', 
                    visibility: collapsed ? 'hidden' : 'visible'
                  }}
                  onClick={() => {CollapseDescendants(child);}}
                >
                  <i 
                    id = {child.id+"-collapse-icon"} 
                    style = {{fontSize: String(buttonSize)+'px'}}
                    className={(isCollapsed(child)) ? 'pi pi-angle-down treenode-action-icon center-text' : 'pi pi-angle-up treenode-action-icon center-text'}
                  />
                </button>
              )
              }
              <button className='treenode-action-button button center-text' id = {child.id+"-create"}
                style = {{height: String(buttonSize)+'px', width: String(buttonSize)+'px', 
                  maxHeight: String(buttonSize)+'px', maxWidth: String(buttonSize)+'px', 
                  left: String(left-buttonSize)+'px', top: String((row*nodeSize*1.5)+verticalOffset+0.1*nodeSize)+'px',
                  borderRadius: String(buttonSize*0.2)+'px', 
                  visibility: collapsed ? 'hidden' : 'visible'
                }}
                onClick={() => {RenderCreationButtons(child.id, true)}}
              >
                <i 
                    id = {child.id+"-create-icon"} 
                    style = {{fontSize: String(buttonSize)+'px'}}
                    className='pi pi-plus treenode-action-icon center-text'
                />
              </button>
            </>
          )
        }
        <Draggable 
            position={{x: 0, y: 0}} 
            onStart = {() => { if(NotDraggable(child)) return false; scrollXBefore = window.scrollX; scrollYBefore = window.scrollY;}} 
            onStop = {(drag) => {if(dragging){OnDropNode(drag, child);} }} 
            onDrag = {(drag) =>{if(!dragging){StartDrag(child);} RepositionSubTree(drag, child);}}
        >
          <div 
            id = {child.id} 
            className={child.id+" treenode-container text-overflow center-text"} 
            onPointerOver={() => {mouseOverNode = child.id;}}
            onPointerOut={() => {mouseOverNode = null;}} 
            style = {{borderRadius: String(nodeSize*0.2)+'px', top: String((row*nodeSize*1.5)+verticalOffset)+'px' , 
                      left: String(left)+'px', height: String(nodeSize)+'px', width: String(nodeSize)+'px', 
                      maxHeight: String(nodeSize)+'px', maxWidth: String(nodeSize)+'px', 
                      visibility: collapsed ? 'hidden' : 'visible'
                    }}
          >
            <Provider store ={store}>
              <TreeNode
                unsavedTreePositions={UnsavedTreePositions}
                reRenderTreeNode = {ReRenderTreeNode} 
                thumbnailXHRSentCallBack = {ThumbnailXHRSentCallBack}
                thumbnailXHRDoneCallBack = {ThumbnailXHRDoneCallBack}
                setChangeTracker = {UpdateChangeTrackerCallback}
                rootNode = {tree} 
                render = {ReRenderTree} 
                inputNode = {child} 
                css = {{nodeSize: nodeSize}} 
                nodeList = {nodeList} 
                nodeDictionary = {nodeDictionary}
                countries = {countries}
              />
            </Provider> 
          </div>
        </Draggable>
      </>
    );
  }

  function ReRenderTreeNodeMutex() {
    if(rendering || resetting) {
        setTimeout(ReRenderTreeNodeMutex, 50);
        return;
    }
  }

  //units used are pixels
  function GetNodeDimensions(zoomPercentage = null)
  {
    const width = IsDesktop() ? window.innerWidth : screen.width;
    const height = IsDesktop() ? window.innerHeight : screen.height;
    const horizontalBorder = IsDesktop() ? horizontalTreeMargin : width/20;

    const verticalOffset = GetVerticalOffset();
    const maximumNodeSize = height > width ? height*0.5 : width * 0.65;
    const trueMinimumSize = 0.5/pixelsToCentimetres;

    if(zoomPercentage)
    {
      return ((maximumNodeSize-trueMinimumSize)*zoomPercentage/100)+trueMinimumSize;
    }

    const verticalSpace = 0.96*height - verticalOffset;
    const horizontalSpace = width -  (2*horizontalBorder);

    const maxHeight = verticalSpace/treeHeight;
    const maxWidth = horizontalSpace/treeWidth;

    const maxDimension = (maxHeight < maxWidth ? maxHeight : maxWidth);
    const minimumCheck = maxDimension < minimumNodeSize ? (IsDesktop() ? minimumNodeSize : maxWidth) : maxDimension;
    const maximumCheck = minimumCheck > maximumNodeSize ? maximumNodeSize  : minimumCheck;

    return maximumCheck;
  }

  function InitialTreeRender(tree)
  {
    ClearLines();
    rendering = true;
    const Jsx = RenderTree(true, tree);
    rendering = false;

    return Jsx;
  }

  function RenderTree(reRender, tree, zoomPercentage = null, parent = null, row = 0, parentLeft = window.innerWidth/2, path = 'middle')
  {
    if(tree)
    {
      const width = IsDesktop() ? window.innerWidth : screen.width;
      const horizontalBorder = IsDesktop() ? horizontalTreeMargin : width/20;

      testRender = false;
      maxLevels = new Object();
      childPositions = new Object();
      nodeDictionary = new Object();
      SetTreeDimensions(tree, zoomPercentage);
   
      maxLevels = new Object();
      childPositions = new Object();
      nodeDictionary = new Object();
     
      testRender = true;
      PrepRenderChildren(tree, parent, row, parentLeft, path);
      testRender = false;

      const newTreeWidth = treeWidth*nodeDimension;
      const horizontalSpace = width -  (2*horizontalBorder);
      let offSet = 0;

      if(newTreeWidth > horizontalSpace)
      {
        offSet = horizontalBorder-treeWidthMin;
      }
      else
      {
        const bufferSpace = horizontalSpace-newTreeWidth;
        const leftMost = bufferSpace/2+horizontalBorder;
        offSet = leftMost-treeWidthMin;
      }
      return RenderChildren(reRender, tree, tree, 0, offSet);
    }
    else if(treeDetails)
    {
      return EmptyTreeJSX();
    }

    return <></>;
  }

  function SetTreeDimensions(tree, zoomPercentage = null)
  {
    nodeDimension = 1;
    treeWidthMax = null;
    treeWidthMin = null;
    treeHeight = 0;
    treeWidth = 0;

    PrepRenderChildren(tree);
    treeWidth = treeWidthMax-treeWidthMin+1;
    treeHeight = treeHeight > 1 ? ((treeHeight-1)*1.5)+1 : treeHeight;
    nodeDimension = GetNodeDimensions(zoomPercentage); 
  }

  function SetTreeWidths(value)
  {
    if(treeWidthMax == null)
    {
      treeWidthMax = value;
      treeWidthMin = value;
    }
    else
    {
      treeWidthMax = value > treeWidthMax ? value : treeWidthMax;
      treeWidthMin = value < treeWidthMin ? value : treeWidthMin;
    }
  }

  function GetVerticalOffset() 
  {
    const width = IsDesktop()? window.innerWidth : screen.width;
    const height = IsDesktop()? window.innerHeight : screen.height;

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const headerPresent = (width/rootFontSize) >= 33.5;
    const totalRems = headerPresent ? 3.2+iconDimension : iconDimension;
    const totalPixels = rootFontSize*totalRems;

    return totalPixels+(0.03*height);
  }

  function GetButtonSize()
  {
    const maxSize = horizontalTreeMargin;
    const suitableSize = nodeDimension/3;

    return suitableSize <= maxSize ? suitableSize : maxSize;
  }
  
  function RenderChildren(reRender, tree, node, row = 1, offset = 0, collapsed = false, buttonSize = GetButtonSize())
  {  
      const verticalOffset = GetVerticalOffset();
      const elements = [];
      
      if(reRender)
      {
        elements.push((AppendChildNode(tree, node, node["left"]+offset, row, nodeDimension, verticalOffset, buttonSize, collapsed)));
      }
      else
      {
        const nodeElement = document.getElementById(node.id);
        if(nodeElement)
        {
          nodeElement.style.left = String(node["left"] + offset)+"px";
          nodeElement.style.top = String((row*nodeDimension*1.5)+verticalOffset)+'px'
          nodeElement.style.maxHeight = String(nodeDimension)+'px';
          nodeElement.style.maxWidth = String(nodeDimension)+'px';
          nodeElement.style.height = String(nodeDimension)+'px';
          nodeElement.style.width = String(nodeDimension)+'px';
          nodeElement.style.borderRadius = String(nodeDimension*0.2)+'px';
          nodeElement.style.visibility = collapsed ? 'hidden': 'visible';
        }

        if(IsDesktop())
        {
          const addChildIcon = document.getElementById(node.id+"-create-icon");
          if(addChildIcon)
          {
            addChildIcon.style.fontSize = String(buttonSize)+'px';
          }

          const addChildButton = document.getElementById(node.id+"-create");
          if(addChildButton)
          {
            addChildButton.style.left = String(node["left"]-buttonSize+offset)+'px';
            addChildButton.style.top = String((row*nodeDimension*1.5)+verticalOffset+0.1*nodeDimension)+'px';
            addChildButton.style.height =  String(buttonSize)+'px';
            addChildButton.style.width =  String(buttonSize)+'px';
            addChildButton.style.maxHeight =  String(buttonSize)+'px';
            addChildButton.style.maxWidth =  String(buttonSize)+'px';
            addChildButton.style.borderRadius = String(buttonSize*0.2)+'px';
            addChildButton.style.visibility = collapsed ? 'hidden': 'visible';
          }

          const buttonText = document.getElementById(node.id+"-text");
          if(buttonText)
          {
            buttonText.style.fontSize = String(nodeDimension*0.155)+'px';
          }

          if(('children' in node && node.children.length > 0))
          {
            const collapseButton = document.getElementById(node.id+"-collapse");
            if(collapseButton)
            {
              collapseButton.style.left = String(node["left"]-buttonSize+offset)+'px';
              collapseButton.style.top = String((row*nodeDimension*1.5)+verticalOffset+(nodeDimension-buttonSize))+'px';
              collapseButton.style.height =  String(buttonSize)+'px';
              collapseButton.style.width =  String(buttonSize)+'px';
              collapseButton.style.maxHeight =  String(buttonSize)+'px';
              collapseButton.style.maxWidth =  String(buttonSize)+'px';
              collapseButton.style.borderRadius = String(buttonSize*0.2)+'px';
              collapseButton.style.visibility = collapsed ? 'hidden': 'visible';
            }

            const collapseIcon = document.getElementById(node.id+"-collapse-icon");
            if(collapseIcon)
            {
              collapseIcon.style.fontSize = String(buttonSize)+'px';
            }
          }
        }
      }
      
      node["left"] = node['left'] + offset;
      node["top"] = node["top"] + verticalOffset;

      if('collapse' in node && node.collapse) collapsed = true;
      
      node.children.forEach(child => {
        if(reRender)
        {
          elements.push((
            <>
              {RenderChildren(reRender, tree, child, row+1, offset, collapsed, buttonSize)}
            </>
          ));
        }
        else 
        {
          RenderChildren(reRender, tree, child, row+1, offset, collapsed, buttonSize);
        }
      });

      if(reRender){
        return(
          <>       
              {elements.map(child => {
                  
                  return (
                  <>
                    {child}
                  </> );
                  }
              )}        
          </>
        );
      }
  }

  function PrepRenderChildren(tree, parent = null, row = 0, parentLeft = window.innerWidth/2, path = 'middle')
  {
    
    let children = null;
    if(parent != null)
    { 
      children = parent.children;
      
      if(testRender)
      {
        nodeDictionary[parent.id] = parent;
        if(!(String(parent.id) in originalDictionary)) originalDictionary[parent.id] = {...parent};     
        nodeList.push(parent);
      }
    }
    else if(tree != null && tree.children != null)
    {
      children = [tree];
    }
    else{return (<></>);}

    if(children == null){return (<></>);}

    treeHeight = (row) > treeHeight ? (row) : treeHeight;
    
    let nodeSize = nodeDimension;
    let elementWidth = nodeSize*1.5;

    const childElements = [];

    let i = 0;
    let leftCount = elementWidth;
    let childCountOdd = 0;
    let childCountEven = 0;

    if( !(String(row-1) in maxLevels) ) maxLevels[String(row-1)] = {};
    let maxLevel = maxLevels[String(row-1)];

    let parentNodePosition = new Object();
    
    while(i < children.length)
    {
      let child = children[i];

      let maxRight =  'Right' in maxLevel ? maxLevel['Right'] : null;
      let maxLeft = 'Left' in maxLevel ? maxLevel['Left'] : null; 
      let left = 0;

      if(path === 'middle')
      {
        let middleIndex = Math.floor(children.length/2);
        if(children.length%2 == 0){ middleIndex--;}

        let j = 0;
        if(i <= middleIndex)
        {
          j = middleIndex-i;
        }
        else
        {
          j  = i;
        }

        child = children[j];

        let leftSpace = 0;
    
        if((i > 0 && children.length%2==1) && i <= middleIndex){ leftSpace = i > 1 ? -1*leftCount*i : -1*leftCount; }
        if((i > 0 && children.length%2==1) && i > middleIndex){ leftSpace = (i - middleIndex) > 1 ? leftCount*(i - middleIndex) : leftCount; }
        if(children.length%2==0 && i <= middleIndex){ leftSpace = i > 1 ? -1*leftCount*(i-0.75) : -1*leftCount*0.25; }
        if(children.length%2==0 && i > middleIndex){ leftSpace = (i - middleIndex) > 1 ? leftCount*(i - middleIndex - 0.75) : leftCount*0.25; }

        left = leftSpace+parentLeft;
        let pathSplitter = 'middle'; 

        if(i == 0){ pathSplitter = 'middle';}
        else if(i<= middleIndex){ pathSplitter = 'left';}
        else if(i> middleIndex){ pathSplitter = 'right';}

        if(pathSplitter === 'left' && maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
        if(pathSplitter === 'right' && maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        PrepRenderChildren(tree, child, row + 1, left, pathSplitter, false);

        let childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();
        let positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
        if(positionAboveChildren != null && 
         ( (pathSplitter === "middle" ) ||
          (pathSplitter === "left" && ( maxLeft == null || positionAboveChildren <= maxLeft-elementWidth ) ) ||
          (pathSplitter === "right" && ( maxRight == null || positionAboveChildren >= maxRight+elementWidth ) )))
        {
           left = positionAboveChildren; 
        }

        if(maxLeft == null || left < maxLeft) maxLevel["Left"] = left;
        if(maxRight == null || left > maxRight) maxLevel["Right"] = left;

        if(parent){
          if(i == middleIndex && children.length > 1 ){ parentNodePosition["Left"] = left; }
          if(i == children.length-1 && children.length > 1 ){ parentNodePosition["Right"] = left; }
          if(children.length == 1){ parentNodePosition["Left"] = left; parentNodePosition["Right"] = left; }
          if(i >= children.length-1)
          {
            childPositions[String(parent.id)] = parentNodePosition;
          }
        }
      }
      else if(path === 'right')
      {
        let leftSpace = 0;
        leftSpace = leftCount*(-1*(children.length-1)/2+i);
        left = leftSpace+parentLeft; 

        let pathSplitter = 'right'; 
        
        if(maxRight != null && left < maxRight+elementWidth) left = maxRight+elementWidth;

        PrepRenderChildren(tree, child, row + 1, left, pathSplitter, false);
        let childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();

        let positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
        if(positionAboveChildren != null && (maxRight == null ||  positionAboveChildren >= maxRight+elementWidth)){
           left = positionAboveChildren; 
        }

        maxLevel["Right"] = left;

        if(maxLeft == null || left < maxLeft) maxLevel["Left"] = left;

        if(children.length == 1 && parent){parentNodePosition["Left"] = left; parentNodePosition["Right"] = left;}
        if(children.length > 1 && i==0 && parent){ parentNodePosition["Left"] = left; }
        if(children.length > 1 && i >= children.length-1 && parent)
        { 
          parentNodePosition["Right"] = left;
        }
        if(i >= children.length-1 && parent)  childPositions[String(parent.id)] = parentNodePosition;
      }
      else if(path === 'left')
        {
          child = children[children.length-1-i];
          let leftSpace = 0;
          leftSpace = leftCount*((children.length-1)/2-i);
          left = leftSpace+parentLeft;
  
          let pathSplitter = 'left'; 
          
          if(maxLeft != null && left > maxLeft-elementWidth) left = maxLeft-elementWidth;
  
          PrepRenderChildren(tree, child, row + 1, left, pathSplitter, false);    
            
          let childPositionsOfNode = (String(child.id) in childPositions) ? childPositions[String(child.id)] : new Object();
  
          let positionAboveChildren = child.children.length > 0 ? childPositionsOfNode["Left"]+(childPositionsOfNode["Right"]-childPositionsOfNode["Left"])/2 : null;
          if(positionAboveChildren != null && (maxLeft == null || positionAboveChildren <= maxLeft-elementWidth)){
             left = positionAboveChildren; 
          }
  
          maxLevel["Left"] = left;
  
          if(maxLeft == null || left > maxRight) maxLevel["Right"] = left;
  
          if(children.length == 1 && parent){parentNodePosition["Right"] = left; parentNodePosition["Left"] = left; }
          if(children.length > 1 && i== 0 && parent){ parentNodePosition["Right"] = left; }
          if(children.length > 1 && i >= children.length-1 && parent)
          { 
            parentNodePosition["Left"] = left;
          }
          if(i >= children.length-1 && parent) childPositions[String(parent.id)] = parentNodePosition;
        }

        if(testRender)
        {
          child["left"] = left; 
          child["top"] = (row)*elementWidth;
          child['dialog'] = false;
        }
              
        SetTreeWidths(left);
        
        
      i++;
    
    }
  }

  const GetUpdateNodeObject = (node) =>
    {
        const updateNodeObject =
        {
            id: node.id,
            data: node.data,
            title: node.title,
            number: node.number,
            description: node.description,
            rankId: node.rankId,
            country: node.country,
            region: node.region,
            level: node.level,
            thumbnailId: node.thumbnailId,
            treeId: node.treeId,
            nodeId: node.nodeId,
            files: [],
            children: []
        };

        return updateNodeObject;
    }

  async function SaveTreePositions()
  {
    const updateNodesList = [];
    Object.keys(changeTracker).forEach(key => {
      const parentId = changeTracker[key];
      const updateNode = GetUpdateNodeObject(nodeDictionary[key]);
      updateNode.nodeId = parentId;
      
      updateNodesList.push(updateNode);
    });

    let result = [];
    if(updateNodesList.length > 0)
    {
      let result = await updateManyNodes(id, updateNodesList);
      if(!result) return;
      
      changeTracker = new Object();
      originalDictionary = structuredClone(nodeDictionary);
      originalTree = structuredClone(tree);
      document.getElementById('save-tree-positions').disabled = true;
      document.getElementById('revert-tree-positions').disabled = true;
    }
  }

  function GetElementPosition(element)
  {
    let position = element.getBoundingClientRect();
    let x = position.left;
    let y = position.top;

    return {X:x, Y:y};
  }

  function DepthFirstMethod(method, node, data = null, sendChild = true, returnerMethod = null)
  {
    if(node == null || !('children' in node)){return (<></>)}

    node.children.forEach(child => 
      {
        DepthFirstMethod(method, child, data, sendChild, returnerMethod);
        if(data && sendChild){ method(data, node, child); }
        else if(data && !sendChild){ method(data, node); }
        else if(!data && sendChild){ method(node, child); }
        else{ method(node);}
      });

    //return returnerMethod;
  }

  function ResetSubtree(node)
  {

    const nodeElement = document.getElementById(node.id);
    nodeElement.style.left = String(node['left'])+"px";
    nodeElement.style.top = String(node['top'])+"px";

    const lineElements = node.nodeId ? document.getElementsByClassName(node.nodeId+"_"+node.id) : [];
    if(lineElements && lineElements.length > 0)
    {
      const line = lineElements[0];
      const lineStyle = node['line'];
      line.style.top = String(lineStyle.top)+"px";
      line.style.left = String(lineStyle.left)+"px";
    }
    
    node.children.forEach(child => {
      ResetSubtree(child);
    })
  }

  function RepositionDescendants(data, parent, child)
  {
    const X = data.X;
    const Y = data.Y;

    const childElement = document.getElementById(child.id);
    const line = document.getElementsByClassName(parent.id+"_"+child.id).length > 0 ? document.getElementsByClassName(parent.id+"_"+child.id)[0] : null;
  
    childElement.style.top = String((child["top"]+Y))+"px";
    childElement.style.left = String((child["left"]+X))+"px";
    childElement.style.transform = 'none';

    if(line)
    {
      if(!('line' in child))
      {
        child['line'] = {left: Number(line.style.left.substring(0, line.style.left.length-2)), top: Number(line.style.top.substring(0, line.style.top.length-2))}
      }

      const top = child['line'].top;
      const left = child['line'].left

      line.style.top = String(top+Y)+"px";
      line.style.left = String(left+X)+"px";
    }
  }

  function RepositionSubTree(dragEvent, node, scroll = null)
  {

    scrollDistanceX = window.scrollX-scrollXBefore;
    scrollDistanceY = window.scrollY-scrollYBefore;

    const nodeElement = document.getElementById(node.id);
    const positionAfter = GetElementPosition(nodeElement);
    const X = positionAfter.X;
    const Y = positionAfter.Y;

    if(!('position' in node))
    {
      node['position'] = positionAfter;
    }  

    const positionBefore = node['position'];
    const xOffset = X-positionBefore.X+scrollDistanceX;
    const yOffset = Y-positionBefore.Y+scrollDistanceY;

    DepthFirstMethod(RepositionDescendants, node, {X: xOffset, Y: yOffset});
    
    //scrollXBefore = window.scrollX;
    //scrollYBefore = window.scrollY;
  }

  function RemoveLines(node, extra = false)
  {

    //createRoot(document.getElementById('line-container-insert')).render(<></>);
    //createRoot(document.getElementById('line-container')).render(<></>);
    //DepthFirstMethod(RemoveLine, tree, null, false);
    RemoveLine(node, extra);
    node.children?.forEach(child => {
      RemoveLines(child, extra);
    })

  } 

  function ClearLines()
  {
    const lineContainer = document.getElementById('line-container')
    if(lineContainer)
    {
      const lines = lineContainer.children;
      let i = 1;
      while(i < lines.length)
      {
        lines[i].remove();
      }
    }
  }

  function AddLine(node)
  {
    if(node.nodeId) createRoot(document.getElementById('line-container-insert')).render
    (
      <LineTo within={'line-container'}  style ={{zIndex: 0}} delay id = {node.nodeId+"_"+node.id} from={node.nodeId} to={node.id} className = {node.nodeId+"_"+node.id} />
    );
  }
  
  function AddLines(node, collapsed = false)
  {


    const isCollapsed = collapsed;
    const lines = [];

    RemoveLine(node);

    if(isCollapsed)
    {
      const nodeHTMLElement = document.getElementById(node.id);
      if(nodeHTMLElement)
      {
        nodeHTMLElement.style.display = 'table';
        nodeHTMLElement.style.visibility = 'hidden';
      }

      const newChildButton = document.getElementById(node.id+"-create");
      if(newChildButton)
      {
        newChildButton.style.display = 'block';
        newChildButton.style.visibility = 'hidden';
      }

      if(node.children.length > 0)
      {
        const collapseButton = document.getElementById(node.id+"-collapse");
        if(collapseButton)
        {
          collapseButton.style.display = 'block';
          collapseButton.style.visibility = 'hidden';
        }
      }
    }
    
    if('collapse' in node && node.collapse)
    {
      collapsed = true;
    }

      node.children.forEach(child => 
      {           
          lines.push(
            <>
              <LineTo within = {'line-container'} id={node.id+"_"+child.id} from={node.id} to={child.id} className= {collapsed ? node.id+"_"+child.id+" hidden" : node.id+"_"+child.id}/> 
              {AddLines(child, collapsed)}
            </>
          )        
      }
    );

    const lineJSX = 
      (<>
        {lines.map(child => {
            
            return (
            <>
              {child}
            </> );
            }
        )}
      </>
    );

    const lineContainer = createRoot(document.getElementById('line-container-insert'));
    lineContainer.render(lineJSX);
  }

  function RenderCreationButtons(parentId = null, openCreate = false)
  {
    const createContainer = createRoot(document.getElementById('create-container'));
    createContainer.render(CreationButtons(parentId, openCreate));
  }

  const CreationButtons = (parentId = null, openCreate = false) => 
  {
    return (
      <>
        <Provider store ={store}>
          <CreateRoot countries = {countries} treeId = {id} render = {ReRenderTree} rootNode = {tree} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
        </Provider>
        <Provider store ={store}>
          <CreateNode parentId = {parentId} openCreate = {openCreate} countries = {countries}  treeId = {id} render = {ReRenderTree} rootNode = {tree} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
        </Provider>
      </> 
    );
  }

  function SetPositions(node)
  {
    if(node != null && 'id' in node){  
      const nodeElement = document.getElementById(node.id);
      node['position'] = GetElementPosition(nodeElement);
      nodeElement.children.forEach(child => 
        {
          SetPositions(child);
        });
      }
  };

  function CorrectTransforms(node)
  {
    if(node != null && ('children' in node))
    {
      const nodeElement = document.getElementById(node.id);
      if(nodeElement){ nodeElement.style.transform = 'none'; }
      

      node.children?.forEach(child => {
        CorrectTransforms(child);
      })
    }
  }

  const EmptyTreeJSX = () => 
    {
      return (
        <>
             {/* <div className='empty-tree-container' style = {{height: 'fit', width: String(maximumNodeSize)+'px'}}> 
                <button onClick={(event) => {document.getElementById('create-root-button').click();}} className='button-root-empty' >*/}
                <i className='pi pi-warehouse button-root-empty pointer' onClick = {() => { document.getElementById('create-root-button').click();}} />
                <div className='empty-tree-message center-text pointer' onClick = {() => { document.getElementById('create-root-button').click();}}>
                  Click to create a node.
                </div>
            </>
      );
    }

  function isCollapsed(node)
  {
    return 'collapse' in node && node.collapse;
  }

  function RevertTreePositions()
  {
    RenderTreeMutex();
    if(dragging || resetting || rendering) return;
    resetting = true;

    RemoveLines(tree);
    tree = structuredClone(originalTree);
    
    resetting = false;
    ReRenderTree(true);
    resetting = true;
    
    changeTracker = new Object();
    document.getElementById('save-tree-positions').disabled = true;
    document.getElementById('revert-tree-positions').disabled = true;

    resetting = false;
  }

  //slider disabled until improvements are made
  /*
  function RenderSlider(value = 50)
  {
    return (
      <>
        <Slider value={value} onChange={(e) => ReRenderOnSlider(e.value)} className="w-14rem" />  
      </>
    );
  }
  */

  //slider disabled until improvements are made
  /*
  function ReRenderOnSlider(value = 50)
  {
    ReRenderTree(false, null, null, null, null, null, value);
    createRoot(document.getElementById('slider-container')).render(RenderSlider(value));
  }
  */

  return (
    <>
      { (treeFetch && treeDetails) && (
        <>
        <HeaderInfo 
            creator = {false}
            middleText={"Drag and drop nodes upon eachother to change the tree structure. Save or undo these changes using the 2 central buttons."}
          />
        <div id = 'button-container' className='button-container button-container-diagram'>
          <div id = 'button-container-inner' className='button-container-inner' style = {{height: String(iconDimension)+'rem'}}>
            <div className='flex-box-leftmost' style = {{width: String(iconDimension*2+0.1)+'rem',}}>   
                  <button 
                    onClick={(event) => { navigate("/");}}
                    className='button-header button-save tooltip' 
                    style = {{width: String(iconDimension)+'rem'}}
                  >
                    <i className='pi pi-home save-icon diagram-header-icon' />
                    <span className="tooltip-right">Home</span>
                  </button>
              <EditTree id = {id} tree = {treeDetails}/>
            </div>
            { 
              //slider disabled until improvements are made
              /* (IsDesktop()) && 
              (
                <div id = 'slider-container'>    
                  <Slider value={50} onChange={(e) => { ReRenderOnSlider(e.value);}} className="w-14rem" />   
                </div>
              )        
              */
            }      
            <div className='tree-positions-container'>
              <button onClick={() => { RevertTreePositions();}} id = 'revert-tree-positions' className='button-header button-save tooltip' style = {{width: String(iconDimension)+'rem'}}>
                <i className='pi pi-replay save-icon diagram-header-icon' />
                <span className="tooltip-bottom">Revert Tree Positions</span>
              </button>
              <button onClick={() => { SaveTreePositions();}} id = 'save-tree-positions' className='button-header button-save tooltip'>
                <i className='pi pi-save save-icon' style = {{fontSize: String(iconDimension)+'rem'}} />
                  <div className='save-position-changes'>
                    Save Position Changes
                  </div>
                <span className="tooltip-bottom">Save Tree Positions</span>
              </button>
            </div>
            <div id = 'create-container' className='create-container' style = {{width: String(iconDimension*2+0.1)+'rem', marginRight: '1.5rem'}}>
                {CreationButtons()}
            </div>
          </div>
        </div> 
        <div id = 'line-container' className='line-container'>
          <div id = 'line-container-insert' className='line-container-insert'>
          </div>
        </div>
        <div id = 'tree-root'>       
              {InitialTreeRender(tree)}                 
        </div>
        <div id = 'dialog-container'>
        </div>
      </>
      )
      }
    </>
  );
});

export default Tree
