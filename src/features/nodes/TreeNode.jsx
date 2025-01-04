import React, {useEffect, useState, useRef} from 'react'
import { useDispatch} from 'react-redux'
import { Dialog } from 'primereact/dialog';
import './DetailsList.css';
import NodeDetails from './NodeDetails';
import Draggable from 'react-draggable';
import { cloneNode } from './nodeSlice';


const TreeNode = ({setChangeTracker, rootNode, render, inputNode, css, nodeList, nodeDictionary}) => {
    const[dialog, setDialog] = useState(false);

    const dispatch = useDispatch();
    const[manualReRender, setManualReRender] = useState(1); //used for callback re renders
    const [mobile, setMobile] = useState(window.innerHeight > 0.85 * window.innerWidth ? true : false);
    
    //After file gallery is added, set this to an api call to get
    //all files by node id on click/open of node details
    const[files, setFiles] = useState(inputNode.files);    
    var buttonMouseDown = new Object();
    var buttonMouseUp = new Object();

    
    useEffect(() => {

        if(dialog && inputNode['dialog'])
        {
            window.addEventListener('resize', isMobile);
        }
        else
        {
            window.removeEventListener('resize', isMobile);
        }

        return () => window.removeEventListener('resize', isMobile);
    });    

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

    //used for callback re renders
    function RenderTreeNode()
    {
        setManualReRender(-1*manualReRender);
    }

    const CloseDialog = () =>
    {
        inputNode['dialog'] = false;
        window.removeEventListener('resize', isMobile);
        setDialog(false);
    }


    function GetElementPosition(element)
    {
        var position = element.getBoundingClientRect();
        var x = position.left;
        var y = position.top;

        return {X:x, Y:y};
    }

    function ValidateButtonClick(element)
    {
        buttonMouseUp = GetElementPosition(element);
        if(buttonMouseUp.X === buttonMouseDown.X && buttonMouseUp.Y === buttonMouseDown.Y)
        {
            
            inputNode["dialog"] = true;
            dispatch(cloneNode(inputNode));
            setDialog(true);
            //GetFilesByNodeId(inputNode.id);         
        }
    }

    function RemoveDescendants(node, list)
    {
        const removeIndex = list.findIndex((object) => object.id === node.id);
        if(removeIndex > -1)  list.splice(removeIndex, 1);
        node.children.forEach(child => {
            RemoveDescendants(child, list);
        });
    }

    function CompareNodes(a, b)
    {
        if ( a.title < b.title ){                                                                   
            return -1;
          }
          if ( a.title > b.title ){
            return 1;
          }
          return 0;
    }

    function GetNodeList()
    {   
        const newList = [...nodeList];
        RemoveDescendants(inputNode, newList);
        return newList.sort(CompareNodes);
    }

    function GetImageSource()
    {
        var index = inputNode.files.findIndex((object) => object.id.toLowerCase() === inputNode.thumbnailId.toLowerCase());
        if(index != -1)
        {
            return inputNode.files[index].base64;
        }

        var file = inputNode.files.find((object) => object.name === inputNode.thumbnailId);
        return file.base64;
    }

        return(
            <>  
                { inputNode.thumbnailId ? 
                    <div style = {{height: String(css.nodeSize)+'px', width: String(css.nodeSize)+'px'}}>
                        <img className='image' style = {{cursor: 'pointer'}} onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} src = {GetImageSource()}/>
                        <div
                            onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}}
                            style = {{  fontSize: String(css.nodeSize*0.155)+'px',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)', cursor: 'pointer'
                                        ,  color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
                                    }}
                        >
                            {inputNode.title}
                        </div>                      
                    </div>
                    :
                    <button 
                        className='tree-button'       
                        onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} 
                        style = {{ padding: '0 0 0 0 ', fontSize: String(css.nodeSize*0.155)+'px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', maxHeight:String(css.nodeSize)+'px', maxWidth: String(css.nodeSize)+'px',  height: String(css.nodeSize)+'px', width: String(css.nodeSize)+'px'}}>
                        {inputNode.title}
                    </button> 
                } 
                <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>                              
                    <Dialog 
                        style = {{width: mobile ? '88vw' : String(0.45*screen.width)+"px", height: mobile ? '73.9vw' : '86vh', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px'}}
                        className={"dialogContent"} 
                        draggable 
                        showHeader = {false}  
                        contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '16px solid #274df5', borderRadius: mobile ? '5vw' : String(0.05*screen.width)+'px', backgroundColor: '#E0E0E0'}} 
                        visible = {dialog} 
                        onHide={() => {if (!dialog) return; CloseDialog();}}
                    > 
                            <NodeDetails mobile = {mobile} SetChangeTracker = {setChangeTracker} unMount = {CloseDialog} renderTreeNode = {RenderTreeNode} files = {files} rootNode = {rootNode} render = {render} inputNode = {inputNode} nodeList = {GetNodeList()} nodeDictionary = {nodeDictionary}/>
                    </Dialog>
                </Draggable>      
            </> 
        );
}

export default TreeNode 