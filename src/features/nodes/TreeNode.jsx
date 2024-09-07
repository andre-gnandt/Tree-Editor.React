import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
import updateNode from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';

const TreeNode = (input) => {
    const firstRender = useRef(true);
    const props = input.props

        return(
            <div>
                <button>
                    <div>
                        <h1>{props.title}</h1>
                    </div>
                </button>
            </div> );
}

export default TreeNode 