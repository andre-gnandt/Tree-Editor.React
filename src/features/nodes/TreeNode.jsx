import React, {useEffect, useState} from 'react'
import { useDispatch} from 'react-redux';
import './DetailsList.css';
import { cloneNode } from './nodeSlice';
import NodeDialog from './NodeDialog';


const TreeNode = ({rootNode, render, inputNode, css, nodeList, nodeDictionary, countries}) => {
    const[dialog, setDialog] = useState(false);

    const dispatch = useDispatch();
    const[manualReRender, setManualReRender] = useState(1); //used for callback re renders
    const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth ? true : false);
    
    //After file gallery is added, set this to an api call to get
    //all files by node id on click/open of node details
    const[files, setFiles] = useState(inputNode.files);    
    var buttonMouseDown = new Object();
    var buttonMouseUp = new Object();

    
    useEffect(() => {

        if(dialog && inputNode['dialog'])
        {
            window.addEventListener('resize', isPortrait);
        }
        else
        {
            window.removeEventListener('resize', isPortrait);
        }

        return () => window.removeEventListener('resize', isPortrait);
    });    

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

    //used for callback re renders
    function RenderTreeNode()
    {
        setManualReRender(-1*manualReRender);
    }

    const CloseDialog = () =>
    {
        inputNode['dialog'] = false;
        window.removeEventListener('resize', isPortrait);
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
                        <img className='image pointer' onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} src = {GetImageSource()}/>
                        <div
                            className='image-text text-overflow pointer'
                            onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}}
                            style = {{ fontSize: String(css.nodeSize*0.155)+'px'}}
                        >
                            {inputNode.title}
                        </div>                      
                    </div>
                    :
                    <button 
                        className='tree-button text-overflow'       
                        onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} 
                        style = {{ fontSize: String(css.nodeSize*0.155)+'px', maxHeight:String(css.nodeSize)+'px', maxWidth: String(css.nodeSize)+'px',  height: String(css.nodeSize)+'px', width: String(css.nodeSize)+'px'}}>
                        {inputNode.title}
                    </button> 
                } 
                <NodeDialog
                    unMount = {CloseDialog}
                    countries = {countries}
                    portrait = {portrait}
                    open = {dialog}
                    files = {inputNode.files} 
                    render = {render}
                    inputNode = {inputNode}
                    nodeList = {GetNodeList()}
                    nodeDictionary = {nodeDictionary}
                    rootNode={rootNode}
                /> 
            </> 
        );
}

export default TreeNode 