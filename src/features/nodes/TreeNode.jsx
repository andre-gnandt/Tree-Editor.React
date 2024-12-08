import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import './detailsList.css';
import NodeDetails from './NodeDetails';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Draggable from 'react-draggable';


const TreeNode = (props) => {
    const[dialog, setDialog] = useState(false);
    const[manualReRender, setManualReRender] = useState(1); //used for callback re renders
    
    //After file gallery is added, set this to an api call to get
    //all files by node id
    const[files, setFiles] = useState(props.props.files); 
    if(props == null || props.props == null || !('id' in props.props)) return (<></>);   
    var buttonMouseDown = new Object();
    var buttonMouseUp = new Object();

    //used for callback re renders
    function RenderTreeNode(node)
    {
        setManualReRender(-1*manualReRender);
    }

    const CloseDialog = () =>
    {
        props.props['dialog'] = false;
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
            props.props["dialog"] = true;
            setDialog(true);
            //GetFilesByNodeId(props.props.id);         
        }
    }

    function GetImageSource()
    {
        var index = props.props.files.findIndex((object) => object.id.toLowerCase() === props.props.thumbnailId.toLowerCase());
        if(index != -1)
        {
            return props.props.files[index].base64;
        }

        var file = props.props.files.find((object) => object.name === props.props.thumbnailId);
        return file.base64;
    }

        return(
            <>  
                { props.props.thumbnailId ? 
                    <div style = {{height: String(props.css.nodeSize)+'px', width: String(props.css.nodeSize)+'px'}}>
                        <img className='image' style = {{cursor: 'pointer'}} onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} src = {GetImageSource()}/>
                        <div
                            onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}}
                            style = {{  fontSize: String(props.css.nodeSize*0.155)+'px',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)', cursor: 'pointer'
                                        ,  color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
                                    }}
                        >
                            {props.props.title}
                        </div>                      
                    </div>
                    :
                    <button 
                        className='tree-button'       
                        onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} 
                        style = {{ padding: '0 0 0 0 ', fontSize: String(props.css.nodeSize*0.155)+'px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', maxHeight:String(props.css.nodeSize)+'px', maxWidth: String(props.css.nodeSize)+'px',  height: String(props.css.nodeSize)+'px', width: String(props.css.nodeSize)+'px'}}>
                        {props.props.title}
                    </button> 
                } 
                <Draggable onStart={(event) => {const header = document.getElementById('fixed-header'); if(!header.contains(event.target)) return false;}}>                              
                    <Dialog className={"dialogContent"} draggable showHeader = {false}  contentStyle={{overflowY: 'hidden', overflow: 'hidden', zIndex: 5, border: '1vw solid #274df5', borderRadius: '5vw', backgroundColor: '#E0E0E0'}} visible = {dialog} onHide={() => {if (!dialog) return; props.props["dialog"] = false; setDialog(false);}} > 
                        <Provider store = {store}>
                            <NodeDetails setChangeTracker = {props.setChangeTracker} unMount = {CloseDialog} renderTreeNode = {RenderTreeNode} files = {files} rootNode = {props.rootNode} render = {props.render} input = {props.props} nodeList = {props.nodeList} nodeDictionary = {props.nodeDictionary}/>
                        </Provider>
                    </Dialog>
                </Draggable>      
            </> 
        );
}

export default TreeNode 