import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useFavorites } from '@/hooks';

interface FavoriteButtonProps {
  itemId: string;
  size?: string;
  showText?: boolean;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  showText = false,
  className = '',
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const { addToFavorites, removeFromFavorites, checkFavorite, isLoading } = useFavorites();

  useEffect(() => {
    // マウント時にお気に入り状態をチェック
    const checkInitialFavoriteStatus = async () => {
      const status = await checkFavorite(itemId);
      setIsFavorite(status);
      setInitialCheckDone(true);
    };

    checkInitialFavoriteStatus();
  }, [itemId, checkFavorite]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || !initialCheckDone) return;

    try {
      let success;

      if (isFavorite) {
        success = await removeFromFavorites(itemId);
      } else {
        success = await addToFavorites(itemId);
      }

      if (success) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`group flex items-center justify-center ${isLoading ? 'opacity-70 cursor-wait' : 'hover:opacity-80'} ${className}`}
      disabled={isLoading || !initialCheckDone}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      {isFavorite ? (
        <FaHeart className="text-red-500 h-6 w-6" />
      ) : (
        <FiHeart className="text-gray-600 h-6 w-6 group-hover:text-red-500" />
      )}
      
      {showText && (
        <span className="ml-2 text-sm">
          {isFavorite ? 'お気に入り登録済み' : 'お気に入りに追加'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton;
