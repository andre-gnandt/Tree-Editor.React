import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import updateNode from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';
import NodeDetails from './NodeDetails';
import Draggable from 'react-draggable';

const TreeNode = (props) => {
    const[dialog, setDialog] = useState(false);
    if(props == null || props.props == null || !('id' in props.props)) return (<></>);   
    var buttonMouseDown = new Object();
    var buttonMouseUp = new Object();

    function GetElementPosition(element)
    {
        var position = element.getBoundingClientRect();
        var x = position.left;
        var y = position.top;

        return {X:x, Y:y};
    }

    function ValidateButtonClick(element)
    {
        console.log("buttonUp");
        console.log(buttonMouseUp);
        buttonMouseUp = GetElementPosition(element);
        if(buttonMouseUp.X === buttonMouseDown.X && buttonMouseUp.Y === buttonMouseDown.Y)
        {
            setDialog(true);
        }
    }
    
        return(
            <>               
                <button onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target); console.log("buttonDown");
        console.log(buttonMouseDown);}} onClick={(event) => {ValidateButtonClick(event.target);}} style = {{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', maxHeight:String(props.css.nodeSize)+'px', maxWidth: String(props.css.nodeSize)+'px',  height: String(props.css.nodeSize)+'px', width: String(props.css.nodeSize)+'px'}}>
                    {props.props.title}
                </button>                                 
                <Dialog header = {"HEADER"} visible = {dialog} style={{ width: '50vw' }} onHide={() => {if (!dialog) return; setDialog(false)}} > 
                    <NodeDetails input = {props.props}/>
                </Dialog>               
            </> 
        );
}

export default TreeNode 