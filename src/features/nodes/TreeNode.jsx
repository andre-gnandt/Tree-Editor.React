import React, {memo, useEffect, useState, useRef, useCallback} from 'react'
import { useDispatch} from 'react-redux';
import './DetailsList.css';
import { cloneNode } from './nodeSlice';
import NodeDialog from './NodeDialog';
import { Audio } from 'react-loader-spinner';
import { IsDesktop } from '../utils/Functions';

const TreeNode = memo(({unsavedTreePositions, reRenderTreeNode, thumbnailXHRDoneCallBack, thumbnailXHRSentCallBack, rootNode, render, inputNode, css, nodeList, nodeDictionary, countries}) => {
    const firstRender = useRef(true);
    const[dialog, setDialog] = useState(false);
    const thumbnail = useRef(GetThumbnail());
    const req = new XMLHttpRequest();
    const dispatch = useDispatch();
    const [manualReRender, setManualReRender] = useState(1); //used for callback re renders
    const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth ? true : false);
    
    //After file gallery is added, set this to an api call to get
    //all files by node id on click/open of node details   
    const[files, setFiles] = useState(inputNode.files); 
    let buttonMouseDown = new Object();
    let buttonMouseUp = new Object();

    const CloseDialog = useCallback(() =>
    {
        inputNode['dialog'] = false;
        window.removeEventListener('resize', isPortrait);
        setDialog(false);
    }, [inputNode]);
    
    useEffect(() => {

        if(dialog && inputNode['dialog'])
        {
            window.addEventListener('resize', isPortrait);
        }
        else
        {
            window.removeEventListener('resize', isPortrait);
        }

        
        if(!XHRSent() && inputNode.thumbnailId && thumbnail.current == null && inputNode.files.length === 0)
        {
            firstRender.current = false;
            inputNode['thumbnailReq'] = true;
            thumbnailXHRSentCallBack(inputNode);
            req.addEventListener("loadend", ThumbnailLoaded); 
            req.open("GET", "http://localhost:11727/api/Files/"+inputNode.thumbnailId);
            req.send();
        } 

        if(firstRender.current)
        {
            firstRender.current =  false;
            setManualReRender(-1*manualReRender);
        }

        return () => 
        {   
            window.removeEventListener('resize', isPortrait);
        }
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

    function XHRSent(){ return (('thumbnailReq' in inputNode) && inputNode['thumbnailReq']);}
    
    function ThumbnailLoaded(event)
    {
        const file = JSON.parse(event.target.responseText);

        inputNode.files.push({...file});
        thumbnailXHRDoneCallBack(inputNode);
        reRenderTreeNode(inputNode);
    }

    //used for callback re renders
    function RenderTreeNode()
    {
        setManualReRender(-1*manualReRender);
    }

    function GetElementPosition(element)
    {
        let position = element.getBoundingClientRect();
        let x = position.left;
        let y = position.top;

        return {X:x, Y:y};
    }

    function ValidateButtonClick(element)
    {
        buttonMouseUp = GetElementPosition(element);
        if( Math.abs(buttonMouseUp.X-buttonMouseDown.X) <= 10 && Math.abs(buttonMouseUp.Y-buttonMouseDown.Y) <=10)
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

    function GetThumbnail()
    {
        let index = inputNode.files.findIndex((object) => object.id.toLowerCase() === inputNode.thumbnailId.toLowerCase());
        if(index != -1)
        {
            return inputNode.files[index];
        }

        let file = inputNode.files.find((object) => object.name === inputNode.thumbnailId);
        return file;
    }

        return(
            <>  
                { (thumbnail.current && !firstRender.current) ? 
                (
                    <div 
                        style = {{height: '100%', width: '100%'}}
                        onPointerDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} 
                        onPointerOut={(event) => { if(!IsDesktop()){ValidateButtonClick(event.target);}}}
                        onClick={(event) => {ValidateButtonClick(event.target);}}
                    >
                        <img 
                            className='image pointer' 
                            onPointerDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} 
                            onPointerOut={(event) => { if(!IsDesktop()){ValidateButtonClick(event.target);}}}
                            onClick={(event) => {ValidateButtonClick(event.target);}}
                            src = {thumbnail.current ? thumbnail.current.base64 : GetThumbnail().base64}
                        />
                        <div
                            id = {inputNode.id+"-text"}
                            className='image-text text-overflow pointer'
                            onPointerDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} 
                            onPointerOut={(event) => { if(!IsDesktop()){ValidateButtonClick(event.target);}}}
                            onClick={(event) => {ValidateButtonClick(event.target);}}
                            style = {{ fontSize: String(css.nodeSize*0.155)+'px'}}
                        >
                            {inputNode.title}
                        </div>                      
                    </div>   
                )
                    :
                (              
                    inputNode.thumbnailId ? 
                    (
                        <>{
                            <Audio
                                height="100%"
                                width="100%"
                                radius="30%"
                                color="grey"
                                wrapperStyle
                                wrapperClass
                            />
                            }
                        </>
                    )
                    :
                    (
                        <button 
                            id = {inputNode.id+"-text"}
                            className='tree-button text-overflow'       
                            onPointerDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} 
                            onPointerOut={(event) => { if(!IsDesktop()){ValidateButtonClick(event.target);}}}
                            onClick={(event) => {ValidateButtonClick(event.target);}} 
                            style = {{ fontSize: String(css.nodeSize*0.155)+'px', height: '100%', width: '100%'}}>
                            {inputNode.title}
                        </button> 
                    )                   
                ) 
                } 
                <NodeDialog
                    thumbnail={thumbnail.current}
                    unsavedTreePositions = {unsavedTreePositions}
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
});

export default TreeNode 