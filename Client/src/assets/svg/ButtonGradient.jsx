const ButtonGradient = () => {
   return (
      <svg className="block" width={0} height={0}>
         <defs>
            <linearGradient id="btn-left" x1="50%" x2="50%" y1="0%" y2="100%">
               <stop offset="0%" stopColor="#81C784" /> {/* Medium green */}
               <stop offset="100%" stopColor="#1B5E20" /> {/* Dark green */}
            </linearGradient>
            <linearGradient id="btn-bottom" x1="100%" x2="0%" y1="50%" y2="50%">
               <stop offset="0%" stopColor="#2E7D32" /> {/* Medium-dark green */}
               <stop offset="100%" stopColor="#81C784" /> {/* Light green */}
            </linearGradient>
            <linearGradient
               id="btn-right"
               x1="14.635%"
               x2="14.635%"
               y1="0%"
               y2="100%"
            >
               <stop offset="0%" stopColor="#43A047" /> {/* Medium green */}
               <stop offset="100%" stopColor="#1B5E20" /> {/* Dark green */}
            </linearGradient>
            <linearGradient id="btn-top" x1="100%" x2="0%" y1="50%" y2="50%">
               <stop offset="100%" stopColor="#1B5E20" /> {/* Light-medium green */}
               <stop offset="100%" stopColor="#2E7D32" /> {/* Dark green */}
            </linearGradient>
         </defs>
      </svg>
   );
};

export default ButtonGradient;