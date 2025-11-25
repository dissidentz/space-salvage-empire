// src/components/ClickButton.tsx
import { useGameStore } from '@/stores/gameStore';
import { motion } from 'framer-motion';

export const ClickButton = () => {
  const clickDebris = useGameStore(state => state.clickDebris);

  return (
    <div className="flex items-center justify-center h-64">
      <motion.button
        onClick={clickDebris}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-bold shadow-lg hover:shadow-xl"
      >
        Click for
        <br />
        Debris
      </motion.button>
    </div>
  );
};
