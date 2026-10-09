import React from 'react';
import { X, Play, Clock } from 'lucide-react';
import { ProductVideo } from '../types';

interface VideoModalProps {
  video: ProductVideo | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <Play size={16} className="text-white fill-white ml-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">{video.title}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {video.duration}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {video.videoUrl ? (
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-8 text-gray-400">
              <p className="text-lg font-medium mb-2">Demo Video: {video.title}</p>
              <p className="text-sm">Video file preview available once uploaded in admin dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
