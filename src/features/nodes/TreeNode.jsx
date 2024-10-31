import React, { useState, useEffect, useRef } from 'react'
import { Dialog } from 'primereact/dialog';
import './detailsList.css'
import NodeDetails from './NodeDetails';
import { Provider } from 'react-redux';
import { store } from '/LocalTreeData.React/src/store';

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
        buttonMouseUp = GetElementPosition(element);
        if(buttonMouseUp.X === buttonMouseDown.X && buttonMouseUp.Y === buttonMouseDown.Y)
        {
            props.props["dialog"] = true;
            setDialog(true);
        }
    }

        return(
            <>               
                <button onMouseDown= {(event) => {buttonMouseDown = GetElementPosition(event.target);}} onClick={(event) => {ValidateButtonClick(event.target);}} style = {{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'table-cell', maxHeight:String(props.css.nodeSize)+'px', maxWidth: String(props.css.nodeSize)+'px',  height: String(props.css.nodeSize)+'px', width: String(props.css.nodeSize)+'px'}}>
                    {props.props.title}
                </button>                                
                <Dialog className={"dialogContent"} headerStyle={{background: 'white'}} contentStyle={{background: 'white'}} header = {"HEADER"} visible = {dialog} onHide={() => {if (!dialog) return; props.props["dialog"] = false; setDialog(false);}} > 
                    <Provider store = {store}>
                        <NodeDetails input = {props.props}/>
                    </Provider>
                </Dialog>                 
            </> 
        );
}

export default TreeNode 