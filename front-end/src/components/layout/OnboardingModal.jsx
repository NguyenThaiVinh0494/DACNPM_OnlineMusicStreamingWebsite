import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";
import confetti from "canvas-confetti";

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  topics = [],
  artists = [],
  initialTopics = [],
  initialArtists = [],
}) {
  const [step, setStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep(1);
    setSelectedTopics(initialTopics);
    setSelectedArtists(initialArtists);
  }, [initialArtists, initialTopics, isOpen]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedTopics([]);
      setSelectedArtists([]);
    }, 500);
  };

  const persistSelections = () => {
    onComplete?.({
      selectedTopics,
      selectedArtists,
    });
  };

  const toggleTopic = (id) => {
    setSelectedTopics(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleArtist = (id) => {
    setSelectedArtists(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleFinish = () => {
    persistSelections();

    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00d2d2', '#ffffff', '#ff007f']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00d2d2', '#ffffff', '#ff007f']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Close modal
    setTimeout(() => {
      handleClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-[#1a221f] rounded-2xl shadow-2xl w-[90%] max-w-[650px] max-h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {step === 1 ? "1. Thể loại yêu thích của bạn?" : "2. Nghệ sĩ bạn yêu thích?"}
              </h2>
              <button 
                onClick={() => {
                  persistSelections();
                  handleClose();
                }}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {topics.map(topic => {
                      const isSelected = selectedTopics.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`relative aspect-video rounded-xl overflow-hidden shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${isSelected ? 'ring-4 ring-nct-primary scale-[0.98]' : ''}`}
                        >
                          <div className={`absolute inset-0 opacity-80 ${topic.color}`}></div>
                          <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                          <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                            <span className="text-white font-bold text-base drop-shadow-md">{topic.name}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-nct-primary rounded-full flex items-center justify-center shadow-lg">
                              <FiCheck className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-3 sm:grid-cols-4 gap-6"
                  >
                    {artists.map(artist => {
                      const isSelected = selectedArtists.includes(artist.id);
                      return (
                        <button
                          key={artist.id}
                          onClick={() => toggleArtist(artist.id)}
                          className="flex flex-col items-center gap-3 group"
                        >
                          <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden transition-all duration-300 ${isSelected ? 'ring-4 ring-nct-primary scale-[0.95]' : 'group-hover:scale-105 group-hover:shadow-lg'}`}>
                            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-8 h-8 bg-nct-primary rounded-full flex items-center justify-center shadow-lg">
                                  <FiCheck className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <span className={`text-sm font-semibold text-center transition-colors line-clamp-1 ${isSelected ? 'text-nct-primary' : 'text-gray-900 dark:text-white group-hover:text-nct-primary'}`}>
                            {artist.name}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-3 bg-gray-50 dark:bg-white/5 shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mr-auto">
                Bạn có thể chọn nhiều mục, hoặc bỏ qua.
              </p>
              {step === 1 ? (
                <button 
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-nct-primary hover:bg-[#2591c4] text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
                >
                  {selectedTopics.length > 0 ? "Tiếp tục" : "Bỏ qua"}
                </button>
              ) : (
                <button 
                  onClick={handleFinish}
                  className="px-6 py-2.5 bg-nct-primary hover:bg-[#2591c4] text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
                >
                  {selectedArtists.length > 0 ? "Hoàn thành" : "Bỏ qua"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
