import loadingGif2 from '../assets/loading2.gif';

const Loading = ({large}) => {
   return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-10px' }}>
         <img src={loadingGif2} alt="Loading..." style={{ width: large ? '100px' : '50px', height: large ? '100px' : '50px' }} />
      </div>
   )
}

export default Loading