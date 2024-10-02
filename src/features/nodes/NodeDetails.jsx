import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';

const NodeDetails = (input) => {
    const dispatch = useDispatch();
    const node = useSelector(state => state.node);
    const firstRender = useRef(true);
    const props = input.input

    if(firstRender.current){
        dispatch(cloneNode(props));
    }

    const handleChange = (value, method) => {
        firstRender.current = false;
        dispatch(method(value));
    }

    const setNode = (prop) => {
        prop.data = node.data;
        prop.title = node.title;
        prop.number = node.number;
        prop.level = node.level;
        prop.nodeId = node.nodeId;
        prop.id = node.id;
    }

        return(
            <div>
                <div>
                    <h1>{node.title}</h1>
                </div>
                <div>
                    Data: <InputText onChange = {(e) => handleChange(e.target.value, updateNodeData)} value = {node.data} />
                </div>
                    Number: <InputText onChange = {(e) => handleChange(e.target.value, updateNodeNumber)} value = {node.number ? node.number : ""} />
                <div>
                    <button onClick = {() => {updateNode(node.id, node); setNode(props); }}> Save </button>
                    <button onClick = {() => handleChange(props, cloneNode)} > Reset </button>
                </div>
            </div> );
}

export default NodeDetails 