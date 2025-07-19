import check from '../assets/check.png';

const Check = () => {
   return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'px' }}>
         <img src={check} width={15} height={15} alt="Check" />
      </div>
   );
}

export default Check