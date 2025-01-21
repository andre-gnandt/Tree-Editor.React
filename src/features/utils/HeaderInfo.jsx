import '../trees/tree.css';
import '../nodes/DetailsList.css';

const HeaderInfo = ({fixed = true, creator = true, middleText = null}) => {
    
    
    return (
        <div
            id = 'header-container' 
            className={ fixed ? 
                        (middleText ? 'header-container middle-text fixed': 'header-container fixed') : 
                        (middleText ? 'header-container middle-text': 'header-container')}
        >
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