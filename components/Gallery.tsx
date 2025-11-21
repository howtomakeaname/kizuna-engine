
import React, { useEffect, useState } from 'react';
import { X, Image as ImageIcon, Calendar, Loader2, Download } from 'lucide-react';
import { SavedCG } from '../types';
import { getGallery } from '../services/db';
import { TranslationType } from '../i18n/translations';

interface GalleryProps {
  onClose: () => void;
  t: TranslationType;
}

const Gallery: React.FC<GalleryProps> = ({ onClose, t }) => {
  const [images, setImages] = useState<SavedCG[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<SavedCG | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const items = await getGallery();
        setImages(items);
      } catch (e) {
        console.error("Failed to load gallery", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleDownload = (e: React.MouseEvent, image: SavedCG) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.imageData;
    link.download = `kizuna_${image.type}_${image.timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-600 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-6 h-6" />
            <h2 className="text-2xl font-display font-bold">{t.gallery.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-pink-500" />
              <p>{t.gallery.loading}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
              <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">{t.gallery.empty}</p>
              <p className="text-sm">{t.gallery.emptyDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((cg) => (
                <div 
                  key={cg.id} 
                  onClick={() => setSelectedImage(cg)}
                  className="group relative aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <img 
                    src={cg.imageData} 
                    alt={cg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-lg">{cg.title}</h3>
                    <p className="text-gray-200 text-xs line-clamp-2">{cg.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-gray-400 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(cg.timestamp).toLocaleDateString()}
                      </div>
                      <button 
                        onClick={(e) => handleDownload(e, cg)}
                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                        title={t.game.download}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for selected image */}
      {selectedImage && (
        <div 
          className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage.imageData} 
            alt={selectedImage.title}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
          />
          <div className="mt-4 text-white text-center flex flex-col items-center gap-3">
            <div>
                <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                <p className="text-gray-400 max-w-xl mx-auto mt-2">{selectedImage.description}</p>
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={(e) => handleDownload(e, selectedImage)}
                    className="flex items-center px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-full text-sm font-bold transition-colors"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {t.game.download}
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-300">{t.gallery.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
