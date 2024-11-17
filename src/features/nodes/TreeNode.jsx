import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import './detailsList.css';
import NodeDetails from './NodeDetails';
import { Provider } from 'react-redux';
import { store } from '/LocalTreeData.React/src/store';


const TreeNode = (props) => {
    const[dialog, setDialog] = useState(false);
    const[manualReRender, setManualReRender] = useState(1); //used for callback re renders
    const[files, setFiles] = useState(null);
    if(props == null || props.props == null || !('id' in props.props)) return (<></>);   
    var buttonMouseDown = new Object();
    var buttonMouseUp = new Object();

    //used for callback re renders
    const RenderTreeNode = () =>
    {
        setManualReRender(-1*manualReRender);

    }

    const CloseDialog = () =>
    {
        setDialog(false);
    }

    function GetFilesByNodeId(id)
  {
    var value = null;
    fetch("http://localhost:11727/api/Files/Get-Files-By-Node/"+id).then(res=> res.json()).then(
        result => {
          value = result;
          setFiles(value);
          props.props.files = value;
          //if(files != null){
            setDialog(true);
          //}
        }
    );
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
            GetFilesByNodeId(props.props.id);
             
            /*
            if(files != null){
                setDialog(true);
            }
                */
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
                    <div style = {{height: '100%', width: '100%', position: 'relative', textAlign: 'center', color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',}}>
                        <img className='image' style = {{cursor: 'pointer'}} onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} src = {GetImageSource()}/>
                        <div
                            onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}}
                            style = {{  fontSize: String(props.css.nodeSize*0.155)+'px',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)', cursor: 'pointer'}}
                        >
                            {props.props.title}
                        </div>                      
                    </div>
                    :
                    <button 
                        className='tree-button'       
                        onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} 
                        style = {{ padding: '0 0 0 0 ', fontSize: String(props.css.nodeSize*0.155)+'px', backgroundColor: '#f0efe4', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', maxHeight:String(props.css.nodeSize)+'px', maxWidth: String(props.css.nodeSize)+'px',  height: String(props.css.nodeSize)+'px', width: String(props.css.nodeSize)+'px'}}>
                        {props.props.title}
                    </button> 
                }                                   
                <Dialog className={"dialogContent"} showHeader = {false} headerStyle={{background: 'white', height: '0px'}} contentStyle={{background: 'white'}} visible = {dialog} onHide={() => {if (!dialog) return; props.props["dialog"] = false; setDialog(false);}} > 
                    <Provider store = {store}>
                        <NodeDetails setChangeTracker = {props.setChangeTracker} unMount = {CloseDialog} renderTreeNode = {RenderTreeNode} files = {files} rootNode = {props.rootNode} render = {props.render} input = {props.props} nodeList = {props.nodeList} nodeDictionary = {props.nodeDictionary}/>
                    </Provider>
                </Dialog>                 
            </> 
        );
}

export default TreeNode 