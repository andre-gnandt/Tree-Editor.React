import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import './DetailsList.css';

const NodeDetails = (input) => {
    const firstRender = useRef(true);
    const props = input.props
    const dispatch = useDispatch();
    const node = useSelector(state => state.node);
        
    useEffect(() => {
        if(firstRender.current){
            dispatch(cloneNode(props));
        }
    });

    const handleChange = (e, method) => {
        firstRender.current = false;
        dispatch(method(e.target.value));
    }

        return(
            <div>
                <div>
                    <h1>{node.title}</h1>
                </div>
                <div>
                    Data: <InputText onChange = {(e) => handleChange(e, updateNodeData)} value = {node.data} />
                </div>
                    Number: <InputText onChange = {(e) => handleChange(e, updateNodeNumber)} value = {node.number ? node.number : ""} />
                <div>
                    <button > Save </button>
                    <button > Reset </button>
                </div>
            </div> );
}

export default NodeDetails 