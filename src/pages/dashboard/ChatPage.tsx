import React from 'react';
import { useParams } from 'react-router-dom';
import { UserDashboardLayout } from '../../components/layout/UserDashboardLayout';
import { ChatWindow } from '../../components/chat/ChatWindow';

export const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();

  return (
    <UserDashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-brand-text">লাইব্রেরি যোগাযোগ ও চ্যাট</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            অনুমোদিত বই সংগ্রহ ও ফেরত সংক্রান্ত বিষয়ে দায়িত্বশীল ভাইয়ের সাথে সরাসরি কথা বলুন
          </p>
        </div>
        <ChatWindow initialChatId={chatId} />
      </div>
    </UserDashboardLayout>
  );
};
