import { motion } from 'framer-motion';

// Button with ripple effect
export const RippleButton = ({ children, onClick, ...props }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="ripple-button"
            {...props}
        >
            {children}
        </motion.button>
    );
};

// Card with hover lift
export const LiftCard = ({ children, ...props }) => {
    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Stagger animation for lists
export const StaggerList = ({ children }) => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {React.Children.map(children, (child, index) => (
                <motion.div key={index} variants={item}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

// Success checkmark animation
export const SuccessCheckmark = () => {
    return (
        <motion.svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <motion.circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke="#52c41a"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
            />
            <motion.path
                d="M18 30 L26 38 L42 22"
                fill="none"
                stroke="#52c41a"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            />
        </motion.svg>
    );
};

// Page transition
export const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};