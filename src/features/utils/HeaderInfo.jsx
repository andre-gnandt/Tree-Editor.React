import '../trees/tree.css';
import '../nodes/DetailsList.css';

const HeaderInfo = ({fixed = true, creator = true, middleText = null}) => {
    
    
    return (
        <div style ={{position: ''}} 
            id = 'header-container' 
            className={middleText ? 'header-container middle-text': 'header-container'}>
            { (creator) && 
                ( 
                <div className='header-creator'>
                    Creator: Andre Gnandt
                </div>
                )
            }

            { (middleText) && 
                (
                    <div className='center-text header-middle-text'>
                        {middleText}
                    
                    </div>
                )
            }
        </div>
    );
}
export default HeaderInfo 