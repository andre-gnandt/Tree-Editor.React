/*
import 'primeicons/primeicons.css';
import CreateNode from '../nodes/CreateNode';
import CreateRoot from '../nodes/CreateRoot';


const TreeHeader = ({ saveTreePositions, nodeList, nodeDictionary, iconSize, rootNode, render}) => {

    return (
        <>
            <div id = 'button-container-inner' style = {{display:'flex', top: '0px', width: '100vw', height: String(iconSize), justifyContent: 'center', alignItems: 'center'}}>
                <div style = {{height: '100%', width: String(iconSize*4)+"px", marginLeft: 'auto', marginRight: 'auto'}}>
                    <button onClick={() => { saveTreePositions();}} id = 'save-tree-positions' className='button-header' style = {{height: '100%', width: '100%', padding: '0 0 0 0'}}>
                    { //style = {{float: 'left', fontSize: iconSize, color: 'lightGrey'}}
                    }
                        <i className='pi pi-save save-icon' style = {{fontSize: iconSize}} />
                        <div style = {{height: '100%', width: '100%', padding: '0 0 0 0'}}>
                            Save Position Changes
                        </div>
                    </button>
                </div>
                <div style = {{height: '100%', display:'flex', width: String(iconSize*2)+"px",  marginRight: '35px'}}>
                    <CreateRoot iconSize = {iconSize} render = {render} rootNode = {rootNode} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
                    <CreateNode iconSize = {iconSize} render = {render} rootNode = {rootNode} nodeDictionary = {nodeDictionary} nodeList = {nodeList}/>
                </div>
            </div>
        </>
    );
}

export default TreeHeader
*/