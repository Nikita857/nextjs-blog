import { useEffect, useState } from 'react';
import { Button, Listbox, ListboxItem, Avatar } from '@heroui/react';
import CustomModal from '../common/modal';
import { getFriends } from '@/actions/user.action';
import { sharePost } from '@/actions/post.actions';
import { User } from '@/generated/prisma';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
};

export default function SharePostModal({ isOpen, onClose, postId }: Props) {
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchFriends = async () => {
        const result = await getFriends();
        if (result.friends) {
          setFriends(result.friends);
        }
      };
      fetchFriends();
    }
  }, [isOpen]);

  const handleShare = async () => {
    setIsSharing(true);
    const result = await sharePost(postId, Array.from(selectedFriends));
    setIsSharing(false);
    if (result.success) {
      onClose();
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Поделиться с друзьями">
      <div className="w-full max-w-md px-1 py-2">
        <Listbox
          aria-label="Выберите друзей"
          variant="faded"
          selectionMode="multiple"
          selectedKeys={selectedFriends}
          onSelectionChange={setSelectedFriends as any}
        >
          {friends.map((friend) => (
            <ListboxItem
              key={friend.id}
              className="bg-gray-100 dark:bg-neutral-700"
              textValue={friend.name || friend.email!}
              startContent={<Avatar src={friend.image || '/file.svg'} />}
            >
              {friend.name || friend.email}
            </ListboxItem>
          ))}
        </Listbox>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onPress={handleShare} disabled={isSharing || selectedFriends.size === 0}>
          {isSharing ? 'Отправка...' : 'Поделиться'}
        </Button>
      </div>
    </CustomModal>
  );
}

