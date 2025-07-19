import loadingGif2 from '../assets/loading2.gif';

const Loading = () => {
   return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-10px' }}>
         <img src={loadingGif2} alt="Loading..." style={{ width: '50px', height: '50px' }} />
      </div>
   )
}

export default Loading