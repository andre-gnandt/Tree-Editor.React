import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, setStateProperty, updateNodeData, updateNodeNumber, updateNodeDescription, updateNodeTitle, updateNodeParent} from './nodeSlice'
import { DeleteCascade,  DeleteSingle, updateNode, createNode, createRoot } from '../../api/nodes/nodesApi';
import { InputText} from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { GetConfirmDelete, GetDeleteOptions } from '../utils/Functions';
import './DetailsList.css';
import UploadThumbnail from '../utils/UploadThumbnail';

const NodeDetails = ({
    unsavedTreePositions = null,
    unMount,
    render, 
    inputNode, 
    nodeList, 
    create = false,
    root = false,
    countries
    })  =>     
    {
    const dispatch = useDispatch();
    const node = useSelector(state => state.node);
    const [regions, setRegions] = useState(GetRegions(node.country));
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const[titleRequired, setTitleRequired] = useState(true);
    const resetThumbnail = useRef(1);
    const [deleteOptions, setDeleteOptions] = useState("");
    const deleteType = useRef("cascade"); //single | cascade
    const fileChangeCount = useRef(0);
    const [Create, setCreate] = useState(create);
    const [Root, setRoot] = useState(root);
    const disableDeleteButton = unsavedTreePositions ? unsavedTreePositions() : false;;

    const handleChange = (value, method) => {
        dispatch(method(value));
    }

    const SetStateProperty = (key, value) => {
        dispatch(setStateProperty({key: key, value: value}));
    }

    const FileChangeCallBack = (showButtons) => 
    {
        if(showButtons)
        {
            fileChangeCount.current = 1;
        }
        else 
        {
            fileChangeCount.current = 0;
        }

        setHideButtons(changeCount.current+fileChangeCount.current);
    }

    function GetRegions(country) 
    {
        if(!country || country === "None") return [];
        
        const findIndex = countries.findIndex((object) => object.countryName === country);
        const regions = [...countries[findIndex]["regions"]];
        regions.unshift({name: "None", shortCode: "NA"});
        return regions;
    }

    const SetNodeVar = (node) => {
        inputNode.data = node.data;
        inputNode.title = node.title;
        inputNode.number = node.number;
        inputNode.description = node.description;
        inputNode.rankId = node.rankId;
        inputNode.country = node.country;
        inputNode.region = node.region;
        inputNode.level = node.level;
        inputNode.nodeId = node.nodeId;
        inputNode.id = node.id;
        inputNode.files = node.files;
        inputNode.thumbnailId = node.thumbnailId;
        inputNode.treeId = node.treeId;
    }

    const GetUpdateNodeObject = (node) =>
    {
        const updateNodeObject =
        {
            id: node.id,
            data: node.data,
            title: node.title,
            number: node.number,
            description: node.description,
            rankId: node.rankId,
            country: node.country,
            region: node.region,
            level: node.level,
            thumbnailId: node.thumbnailId,
            treeId: node.treeId,
            nodeId: node.nodeId,
            files: [],
            children: []
        };

        return updateNodeObject;
    }

    function CheckValueChange(originalValue, previousValue, newValue)
    {

        if(originalValue != null && String(originalValue).length === 0) originalValue = null;
        if(previousValue != null && String(previousValue).length === 0) previousValue = null;
        if(newValue != null && String(newValue).length === 0) newValue = null;

        const previousChangeCount = changeCount.current;
        if(previousValue ==  originalValue && newValue != originalValue)
        {
            changeCount.current++;
        }
        else if(previousValue !=  originalValue && newValue == originalValue)
        {
            changeCount.current--;
        }

        if((previousChangeCount == 0 && changeCount.current != 0) || (previousChangeCount != 0 && changeCount.current == 0))
        {
            setHideButtons(changeCount.current+fileChangeCount.current);
        }
    }

    function RenderCreateOrSaveButton()
    {
        if(Create || Root)
        {
            return (
                <>Create</>
            );
        }
        
        return (
            <>Save</>
        );
    }

    async function HandleDeleteNode()
    {   
        if(deleteType.current === "single")
        {
            const deleteNode = GetUpdateNodeObject(inputNode);
            const children = [];
            inputNode.children.forEach(child => 
            {
                children.push(GetUpdateNodeObject(child));
            }
            )

            deleteNode["children"]  = children;

            await DeleteSingle(inputNode.nodeId, deleteNode);
            render("delete single", null, node.id, null, node.nodeId);
        }
        else
        {
            await DeleteCascade(inputNode.id);
            render("delete cascade", null, node.id, null, node.nodeId);
        }
        unMount();
    }

    const sortFiles = (a,b) => {
        if(a.name < b.name){ return 1;}
        if(a.name > b.name){return -1;}
        return 0;
    }

    function SetFilesOnUpdate(updatedNode)
    {
        const filesDto = updatedNode.files;
        updatedNode.files = structuredClone(node.files);
        updatedNode.files.sort(sortFiles);
        filesDto.sort(sortFiles);

        var i = 0;
        while(i < filesDto.length)
        {
            updatedNode.files[i].id = filesDto[i].id;
            updatedNode.files[i].data = null;
            i++;
        }
    }

    async function HandleSaveOrCreate()
    {
        if(!node.title || node.title.trim().length === 0)
        {
            setTitleRequired(false);
        }
        else if(!Create && !Root)
        {
            
            var updatedNode = await updateNode(node.id, node); 
            if(!updatedNode) return;
            SetFilesOnUpdate(updatedNode);

            if(node.nodeId != inputNode.nodeId)
            {
                const oldParentId = inputNode.nodeId;
                SetNodeVar(updatedNode);
                render("update", inputNode, node.id, node.nodeId, oldParentId);
            }
            else{
                SetNodeVar(updatedNode);
                render("update", inputNode, node.id, node.nodeId, node.nodeId);
            }

            dispatch(cloneNode(inputNode));
        }
        else if(Create)
        {            
            var resultNode = await createNode(node);
            if(!resultNode) return;
            SetFilesOnUpdate(resultNode);
            
            SetNodeVar(resultNode);
            render("create", inputNode);

            dispatch(cloneNode(inputNode));
            setCreate(false);
        }  
        else if(Root)
        {
            var resultNode = await createRoot(node);
            if(!resultNode) return;
            SetFilesOnUpdate(resultNode);
            
            SetNodeVar(resultNode);
            nodeList.length = 0;
            render("new root", inputNode);

            dispatch(cloneNode(inputNode));
            setRoot(false);
        }  


        if(node.title && node.title.trim().length > 0)
        {
            changeCount.current = 0;
            setHideButtons(0);
        }
    }

    const ResetForm = () =>
    {
        document.getElementById('file-upload-button').value = null;
        changeCount.current = 0; 
        fileChangeCount.current = 0;
        resetThumbnail.current = resetThumbnail.current * -1;
        setHideButtons(0);
        setRegions(GetRegions(inputNode.country));
        //setResetFiles({reset: true}); 
        handleChange(inputNode, cloneNode);
    }

    const CountrySelected = (originalValue, previousValue, newValue) =>
    {
        if(newValue === "None") newValue = null;
        if(newValue != previousValue)
        {
            CheckValueChange(originalValue, previousValue, newValue);
            setRegions(GetRegions(newValue));
            SetStateProperty("country", newValue);
            SetStateProperty("region", null);
        }
    }

    const RegionSelected = (originalValue, previousValue, newValue) => 
    {
        if(newValue === "None") newValue = null;
        if(newValue != previousValue)
        {
            CheckValueChange(originalValue, previousValue, newValue);
            SetStateProperty("region", newValue);
        }
    }

    const GetHeader = () => {
        if(Create)return <>New Node</>;
        if(Root)return <>New Root</>;
        
        return <>Node</>;
    }

        //approx container height = 81.95vh
        return(
        <>  
            <div className='dialog-root'>
                <div id = 'fixed-header' className='fixed-header'>
                    <div className='dialog-header-inner'>
                         <div className='dialog-close-container'>
                            <i onClick={() => {unMount()}} className='pi pi-times dialog-close-button'/>
                        </div>
                        <div className='dialog-header center-text text-overflow'>{GetHeader()}</div>                   
                        <div className={!Create && !Root && node.nodeId ? 'dialog-delete' : 'dialog-delete-skeleton'}>
                        { (node.nodeId && !Root && !Create) && (
                            <>
                                <button disabled = {disableDeleteButton} className='tooltip dialog-delete-button button text-overflow' 
                                    style = {{color: (disableDeleteButton) ? 'blue' : 'white'}}
                                    onClick={() => {setDeleteOptions("options")}}                       
                                >
                                    { disableDeleteButton &&
                                        (
                                            <span class="tooltip-bottom">Unable to delete with unsaved tree positions.</span>
                                        )
                                    }
                                    Delete
                                </button>                   
                                { (deleteOptions === "options") && 
                                    (
                                    <>
                                        {GetDeleteOptions("node", setDeleteOptions, "", setDeleteOptions, "confirm", setDeleteOptions, "confirm", true, deleteType)}
                                    </>
                                    )
                                }
                                { (deleteOptions === "confirm") && 
                                    (
                                    <>
                                        {GetConfirmDelete("node", setDeleteOptions, "", HandleDeleteNode, null, setDeleteOptions, "", true)}
                                    </>
                                    )
                                }
                            </>
                            )
                        }
                        </div>
                    </div> 
                </div>
                <div className={(hideButtons === 0 && titleRequired) ? 'container': 'container-shrunk'}> 
                    <div className='thumbnail-container-outer' /*style = {{marginBottom: mobile ? '5vw': '5.275vh'}} */>
                        <div className="thumbnail-container" style = {{width: '50%'}}>                         
                            <UploadThumbnail reset = {resetThumbnail.current} fileChangeCallBack = {FileChangeCallBack} inputNode = {inputNode} /> 
                        </div>
                        {
                        <div className='title-container expandable-title-container' style = {{width: '50%'}}>
                            <InputTextarea 
                                maxLength={50}
                                autoResize 
                                rows = {1} 
                                placeholder="Title" 
                                className= {(titleRequired ? "title center-text" : "title-required center-text")}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(inputNode.title, node.title, e.target.value); handleChange(e.target.value, updateNodeTitle);}} value = {node.title ? node.title : ""} />
                        </div>
                        }
                    </div>
                    { (!Root && inputNode.nodeId) && (
                        <div className="entryContainer">
                            <div className = "fullWidthLeft vertical-center">
                                Parent:  
                            </div> 
                            <div className="fullWidthRight">
                                <Dropdown  
                                    maxLength={1000}
                                    className = "dropdown text-overflow vertical-center"
                                    placeholder='Select Parent...'
                                    panelStyle={{maxWidth: '95vw',borderRadius: '2vh', color: 'rgba(204, 223, 255, 0.9)', backgroundColor: '#ccffffe6'}}
                                    onFocus={(event) => {}}
                                    //className='input'
                                    disabled = {node.nodeId ? false : true}
                                    filter
                                    onChange = {(e) => {CheckValueChange(inputNode.nodeId, node.nodeId, e.target.value.id); handleChange(e.target.value.id, updateNodeParent);}} 
                                    value = {nodeList.find((object) => object.id === node.nodeId)}
                                    options = {nodeList}
                                    optionLabel='title'
                                    />
                            </div>
                        </div> 
                    )
                    }
                    <div className="entryContainer" style = {{height: '11rem'}}>
                        <div className = "fullWidthLeft">
                            Description:  
                        </div> 
                        <div className="fullWidthRight">
                            {<InputTextarea style = {{fontSize: 'min(1.8rem, 6vw)'}} className = "input vertical-center" maxLength={10000} placeholder='Description...' autoResize rows={5} onChange = {(e) => {CheckValueChange(inputNode.description, node.description, e.target.value); handleChange(e.target.value, updateNodeDescription);}} value = {node.description ? node.description : ""} />}
                        </div>
                    </div>
                    <div className="entryContainer">
                        <div className = "fullWidthLeft vertical-center">
                            Country:  
                        </div> 
                        <div className="fullWidthRight">
                            <Dropdown  
                                maxLength={1000}
                                showClear
                                className = "dropdown text-overflow vertical-center"
                                placeholder='Select Country...'
                                panelStyle={{maxWidth: '95vw', borderRadius: '2vh', color: 'rgba(204, 223, 255, 0.9)', backgroundColor: '#ccffffe6'}}
                                filter
                                onChange = {(e) => {CountrySelected(inputNode.country, node.country, e.target.value ? e.target.value.countryName : null)}} 
                                value = {node.country ? countries.find((object) => object.countryName === node.country) : null}
                                options = {countries}
                                optionLabel='countryName'
                            />
                        </div>
                    </div> 
                    <div className="entryContainer" >
                        <div className = "fullWidthLeft vertical-center">
                            Region:  
                        </div> 
                        <div className="fullWidthRight">
                            <Dropdown  
                                emptyMessage="Select a Country first!"
                                maxLength={1000}
                                showClear
                                className = "dropdown text-overflow vertical-center"
                                placeholder='Select Region...'
                                panelStyle={{maxWidth: '95vw',borderRadius: '2vh', color: 'rgba(204, 223, 255, 0.9)', backgroundColor: '#ccffffe6'}}
                                filter
                                onChange = {(e) => {RegionSelected(inputNode.region, node.region, e.target.value ? e.target.value.name : null)}} 
                                value = {node.region ? regions.find((object) => object.name === node.region) : null}
                                options = {regions}
                                optionLabel='name'
                                />
                        </div>
                    </div> 
                    <div className="entryContainer" style = {{height: '13rem'}}>
                        <div className = "fullWidthLeft">
                            Data: 
                        </div>
                        <div className="fullWidthRight">
                            <InputTextarea className = "input vertical-center" maxLength={20000} placeholder='Data...' autoResize rows={7} onChange = {(e) => {CheckValueChange(inputNode.data, node.data, e.target.value); handleChange(e.target.value, updateNodeData);}} value = {node.data? node.data : ""} />    
                        </div>
                    </div>
                    <div className="entryContainer">
                        <div className = "fullWidthLeft vertical-center" >
                            Number:  
                        </div> 
                        <div className="fullWidthRight">
                            <InputText maxLength={1000} placeholder='Number...' className = "input text-overflow vertical-center" type = 'number' keyfilter='int' onChange = {(e) => {CheckValueChange(inputNode.number, node.number, e.target.value); handleChange(e.target.value, updateNodeNumber);}} value = {node.number ? node.number : ""} />
                        </div>
                    </div>
                    {/*
                    <div className="entryContainer">
                        <div className = "fullWidthLeft">
                            Rank:  
                        </div> 
                        <div className="fullWidthRight">
                            <InputText className = "input" value = {""} />
                        </div>
                    </div>
                    */}
                </div> 
                {
                <div className = 'dialog-save-banner' hidden = {hideButtons === 0 && titleRequired} style = {{height: (hideButtons === 0 && titleRequired)? '0%':'2rem'}}>
                    <div className = 'dialog-save-container' hidden = {hideButtons === 0}  id = 'node-details-button-container'>
                        <button hidden = {hideButtons === 0} className = 'dialog-save-button dialog-save-button-left button text-overflow' onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {hideButtons === 0} className = 'dialog-save-button button text-overflow' onClick = {() => { ResetForm();}} > Reset </button>
                    </div>
                    <div className='text-overflow title-required-container'  hidden = {(titleRequired)}>Title is required!</div>
                </div>
                }
            </div>
        </>    
        );
}

export default NodeDetails 